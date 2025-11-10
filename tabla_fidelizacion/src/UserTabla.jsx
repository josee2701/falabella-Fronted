import React, { useState, useEffect } from "react";
import "./UserTable.css";

const API_URL = "http://localhost:8000/api/clientes/";
const API_EXPORT_URL = "http://localhost:8000/api/download/";
const API_DOC_TYPES_URL = "http://localhost:8000/api/tipos-documento/";


function UserTable() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const [docTypes, setDocTypes] = useState([]);
  const [selectedDocType, setSelectedDocType] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [exportFormat, setExportFormat] = useState("csv");

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

  useEffect(() => {
    fetchUsers(API_URL); 
  }, []);

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
    if (selectedDocType) params.append('tipo_documento', selectedDocType);
    if (docNumber) params.append('numero_documento', docNumber);
    
    params.append('formato', exportFormat);

    const exportUrl = `${API_EXPORT_URL}?${params.toString()}`;
    console.log("Exporting with URL:", exportUrl);

    try {
      const response = await fetch(exportUrl);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const extensionMap = {
        'csv': 'csv',
        'xlsx': 'xlsx',
        'txt': 'txt'
      };
      const ext = extensionMap[exportFormat] || 'csv';
      a.download = `usuarios_export.${ext}`;
      
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (e) {
      console.error("Export failed:", e);
      alert("Failed to export file"); 
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleSearch = () => {
    const params = new URLSearchParams();

  
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
    fetchUsers(API_URL); 
  };


  if (isLoading) {
    return <div className="user-table-container loading">Cargando usuarios...</div>;
  }
  if (error) {
    return <div className="user-table-container error">Error al cargar datos: {error}</div>;
  }

  return (
    <div className="user-table-container">
      <div className="table-controls">
        
        <select
          className="filter-select"
          value={selectedDocType}
          onChange={(e) => setSelectedDocType(e.target.value)}
        >
          <option value="">Seleccionar tipo...</option>
          {docTypes.map((type) => (
            <option key={type.id} value={type.id}> 
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
          {/* NUEVO: Grupo de Exportación */}
          <div className="export-group">
            <select 
              className="export-select"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              disabled={isExporting}
            >
              <option value="csv">CSV</option>
              <option value="xlsx">Excel</option>
              <option value="txt">TXT</option>
            </select>
            <button
              className="export-button"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? "..." : "Exportar"}
            </button>
          </div>
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