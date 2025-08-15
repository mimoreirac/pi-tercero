import Usuario from "../models/Usuario.js";

export const getOrCreateUser = async (req, res) => {
  const { uid, email } = req.user;
  const { numero_telefono, nombre } = req.body;

  try {
    let user = await Usuario.findByFirebaseUid(uid);

    if (user) {
      // Si el usuario existe en la base de datos, lo retornamos
      return res.status(200).json(user);
    }

    // Si no existe lo creamos
    const newUser = await Usuario.create({
      firebase_uid: uid,
      email,
      nombre: nombre,
      numero_telefono,
    });

    res.status(201).json(newUser);
  } catch (error) {
    if (error.message.includes("ya está en uso")) {
      return res.status(409).json({ error: error.message });
    }
    console.error("Error in getOrCreateUser:", error);
    res.status(500).json({ error: "Error al crear o encontrar el usuario" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await Usuario.findByFirebaseUid(req.user.uid);
    if (!user) {
      // Si el sync funciona correctamente, este caso nunca deberia pasar
      return res
        .status(404)
        .json({ error: "Usuario no encontrado en la base de datos local" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el usuario" });
  }
};

export const getById = async (req, res) => {
  try {
    const user = await Usuario.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "El usuario no existe." });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el usuario" });
  }
};

export const updateUser = async (req, res) => {
  try {
    // Utilizamos req.user.uid para que los usuarios solo puedan actualizar su propia cuenta
    const updatedUser = await Usuario.update(req.user.uid, req.body);
    if (!updatedUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    const { ...userResponse } = updatedUser;
    res.status(200).json(userResponse);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el usuario" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    // Similarmente req.user.uid para que los usuarios solo puedan eliminar su propia cuenta
    const deletedUser = await Usuario.delete(req.user.uid);
    if (!deletedUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el usuario" });
  }
};
