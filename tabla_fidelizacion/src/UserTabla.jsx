import React, { useState, useEffect } from "react";
import "./UserTable.css";

const API_URL = "http://localhost:8000/api/clientes/";
const API_EXPORT_URL = API_URL + "download-csv/";
const API_DOC_TYPES_URL = "http://localhost:8000/api/tipos-documento/";


function UserTable() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // 1. ESTADOS FALTANTES: Necesitas esto para controlar los filtros
  const [docTypes, setDocTypes] = useState([]);
  const [selectedDocType, setSelectedDocType] = useState("");
  const [docNumber, setDocNumber] = useState("");

  // 2. REFACTORIZAMOS fetchUsers: Para que pueda ser reutilizada
  const fetchUsers = async (url) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (e) {
      console.error("Failed to fetch users:", e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. useEffect INICIAL (modificado): Llama a la nueva función
  useEffect(() => {
    fetchUsers(API_URL); // Carga inicial de todos los usuarios
  }, []);

  // 4. NUEVO useEffect: Para cargar los tipos de documento
  useEffect(() => {
    const fetchDocTypes = async () => {
      try {
        const response = await fetch(API_DOC_TYPES_URL);
        if (!response.ok) {
          throw new Error("No se pudieron cargar los tipos de documento");
        }
        const data = await response.json();
        setDocTypes(data);
      } catch (e) {
        console.error(e.message);
      }
    };
    fetchDocTypes();
  }, []);


  const handleExport = async () => {
    setIsExporting(true);

    const params = new URLSearchParams();
    if (selectedDocType) {
      params.append('tipo_documento', selectedDocType);
    }
    if (docNumber) {
      params.append('numero_documento', docNumber);
    }

    const exportUrl = `${API_EXPORT_URL}?${params.toString()}`;
    
    console.log("Exportando con URL:", exportUrl);

    try {
      const response = await fetch(exportUrl);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "usuarios.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (e) {
      console.error("Error al exportar:", e);
      setError("No se pudo descargar el archivo.");
    } finally {
      setIsExporting(false);
    }
  };
  
  // 5. FUNCIONES FALTANTES: Para los botones de búsqueda
  const handleSearch = () => {
    const params = new URLSearchParams();

    // Asegúrate que 'tipo_documento' y 'numero_documento'
    // coincidan con los nombres que espera tu API de Django
    if (selectedDocType) {
      params.append('tipo_documento', selectedDocType);
    }
    if (docNumber) {
      params.append('numero_documento', docNumber);
    }

    const searchUrl = `${API_URL}?${params.toString()}`;
    console.log("Buscando con URL:", searchUrl);
    fetchUsers(searchUrl);
  };

  const clearFilters = () => {
    setSelectedDocType("");
    setDocNumber("");
    fetchUsers(API_URL); // Vuelve a cargar todos los usuarios
  };


  // ... Renderizado condicional (está bien) ...
  if (isLoading) {
    return <div className="user-table-container loading">Cargando usuarios...</div>;
  }
  if (error) {
    return <div className="user-table-container error">Error al cargar datos: {error}</div>;
  }

  // ... Renderizado principal ...
  return (
    <div className="user-table-container">
      <div className="table-controls">
        
        {/* Dropdown para Tipo de Documento */}
        <select
          className="filter-select"
          value={selectedDocType}
          onChange={(e) => setSelectedDocType(e.target.value)}
        >
          <option value="">Seleccionar tipo...</option>
          {docTypes.map((type) => (
            <option key={type.id} value={type.id}> {/* <-- ¡Cámbialo a type.id! */}
              {type.nombre}
            </option>
          ))}
        </select>

        {/* Input para Número de Documento */}
        <input
          type="text"
          placeholder="Número de documento"
          className="search-input"
          value={docNumber}
          onChange={(e) => setDocNumber(e.target.value)}
        />

        {/* Botones de acción */}
        <button className="search-button" onClick={handleSearch}>
          Buscar
        </button>
        <button className="clear-button" onClick={clearFilters}>
          Limpiar
        </button>

        <div className="table-actions">
          <button
            className="export-button"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? "Exportando..." : "Exportar CSV"}
          </button>
        </div>
      </div>

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
          {/* 6. CORRECCIÓN EN LA TABLA:
              Debe ser 'users.length' y 'users.map', NO 'filteredUsers' */}
          {users.length > 0 ? (
            users.map((user) => (
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
                No se encontraron resultados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UserTable;