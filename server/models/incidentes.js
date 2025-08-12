import pool from "../db.js";


export const createIncidente = async ({ id_viaje, id_reportador, tipo_incidente, descripcion }) => {
  const result = await pool.query(
    `INSERT INTO incidentes (id_viaje, id_reportador, tipo_incidente, descripcion)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [id_viaje, id_reportador, tipo_incidente, descripcion]
  );
  return result.rows[0];
};


export const getIncidenteById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM incidentes WHERE id_incidente = $1`,
    [id]
  );
  return result.rows[0];
};


export const updateIncidente = async (id, { tipo_incidente, descripcion, estado }) => {
  const result = await pool.query(
    `UPDATE incidentes
     SET tipo_incidente = $1, descripcion = $2, estado = $3
     WHERE id_incidente = $4
     RETURNING *`,
    [tipo_incidente, descripcion, estado, id]
  );
  return result.rows[0];
};


export const deleteIncidente = async (id) => {
  await pool.query(`DELETE FROM incidentes WHERE id_incidente = $1`, [id]);
};