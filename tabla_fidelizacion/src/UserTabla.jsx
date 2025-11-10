import React, { useState, useEffect } from 'react'; 
import './UserTable.css';

const API_URL = 'http://localhost:8000/api/clientes/'; 

function UserTable() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null); 
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setUsers(data);
        
      } catch (e) {
        console.error("Failed to fetch users:", e);
        setError(e.message)
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers(); 
  }, []); 

  const handleCreateUser = () => {
    console.log('Abriendo modal para crear usuario...');
  };

  const filteredUsers = users.filter(user =>
    (user.nombre && user.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.apellido && user.apellido.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.correo && user.correo.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.numero_documento && user.numero_documento.includes(searchTerm))
  );

  // 6. Renderizado condicional para Carga y Error
  if (isLoading) {
    return <div className="user-table-container loading">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="user-table-container error">Error al cargar datos: {error}</div>;
  }

  // 7. Renderizado principal (cuando ya hay datos)
  return (
    <div className="user-table-container">
      
      {/* --- Controles Superiores (Buscador y Botón) --- */}
      <div className="table-controls">
        <input
          type="text"
          placeholder="Buscar por documento, nombre, correo..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="create-button" onClick={handleCreateUser}>
          Crear Usuario
        </button>
      </div>

      {/* --- Tabla de Datos --- */}
      <table className="user-table">
        <thead>
          <tr>
            <th>Número de Documento</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Correo</th>
            <th>Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              // 8. Asegúrate que las propiedades (user.id, user.nombre)
              // coincidan con las de tu API
              <tr key={user.id}> 
                <td>{user.numero_documento}</td>
                <td>{user.nombre}</td>
                <td>{user.apellido}</td>
                <td>{user.correo}</td>
                <td>{user.telefono}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="no-results">
                {/* Mensaje diferente si no hay usuarios vs. no hay resultados de búsqueda */}
                {users.length === 0 ? "No hay usuarios registrados." : "No se encontraron resultados."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UserTable;