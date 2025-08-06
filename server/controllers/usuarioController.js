import Usuario from "../models/Usuario.js";

export const getOrCreateUser = async (req, res) => {
  const { uid, email, name } = req.user; // Debemos setear el displayName del usuario en el frontend para que nos mande un name
  const { numero_telefono } = req.body;

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
      nombre: name,
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

export const getUserById = async (req, res) => {
  try {
    const user = await Usuario.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el usuario" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updatedUser = await Usuario.update(req.params.id, req.body);
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
    const deletedUser = await Usuario.delete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el usuario" });
  }
};
