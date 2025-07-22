import Usuario from "../models/Usuario.js";

export const createUser = async (req, res) => {
  try {
    const newUser = await Usuario.create(req.body);
    const { password_hash, ...userResponse } = newUser;
    res.status(201).json(userResponse);
  } catch (error) {
    if (error.message.includes("ya está en uso")) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: "Error al crear el usuario" });
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
    const { password_hash, ...userResponse } = updatedUser;
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
