import React, { useState } from 'react';
import { Blobatar } from '@blobatar/react';
import './App.css';

const API_LOGIN_URL = `${import.meta.env.VITE_API_URL}/api/auth/login`;
const API_VERIFY_URL = `${import.meta.env.VITE_API_URL}/api/auth/verify`; 

function App() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [sesionIniciada, setSesionIniciada] = useState(false); // Nuevo estado
  const [usuario, setUsuario] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [codigo, setCodigo] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', error: false });
  const [cargando, setCargando] = useState(false);

  // Envía credenciales iniciales
  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ texto: '', error: false });

    try {
      const respuesta = await fetch(API_LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usuario.trim(), clave: password, correo: correo.trim() }),
      });
      const mensajeServidor = await respuesta.text();

      if (respuesta.ok) {
        setMensaje({ texto: 'Código enviado a tu correo.', error: false });
        setMostrarModal(true); 
      } else {
        setMensaje({ texto: `Error: ${mensajeServidor}`, error: true });
      }
    } catch (error) {
      setMensaje({ texto: 'Error: El servidor de Java está apagado.', error: true });
    } finally {
      setCargando(false);
    }
  };

  // Envía el código de verificación
  const handleSubmitCodigo = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ texto: '', error: false });

    try {
      const respuesta = await fetch(API_VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usuario.trim(), codigo: codigo.trim() }),
      });
      const mensajeServidor = await respuesta.text();

      if (respuesta.ok) {
        setMostrarModal(false); 
        setSesionIniciada(true); // Oculta el login y muestra la página de éxito
      } else {
        setMensaje({ texto: `Error: Código incorrecto o expirado`, error: true });
      }
    } catch (error) {
      setMensaje({ texto: 'Error al verificar el código.', error: true });
    } finally {
      setCargando(false);
    }
  };

  // Función para cerrar sesión y reiniciar los estados
  const cerrarSesion = () => {
    setSesionIniciada(false);
    setUsuario('');
    setPassword('');
    setCorreo('');
    setCodigo('');
    setMensaje({ texto: '', error: false });
  };

  // Si la sesión ya se inició, renderizamos la página de éxito
  if (sesionIniciada) {
    return (
      <div className="App" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="formulario" style={{ textAlign: 'center', padding: '40px' }}>
          <Blobatar name={usuario} size={150} />
          <h1 style={{ marginTop: '20px', color: '#333' }}>¡Bienvenido!</h1>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '30px' }}>
            Sesión iniciada correctamente como <strong>{usuario}</strong>.
          </p>
          <button className="btn-entrar" onClick={cerrarSesion}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  // De lo contrario, renderizamos el flujo de login normal
  return (
    <div className="App" style={{ position: 'relative' }}>
      <form className="formulario" onSubmit={handleSubmitLogin}>
        <div>
          <Blobatar name={usuario.trim() || 'invitado'} size={120} />
        </div>
        <h2>Iniciar Sesión</h2>
        
        <div className="campo">
          <label htmlFor="usuario">Usuario:</label>
          <input id="usuario" type="text" placeholder="Ingresa tu usuario"
            value={usuario} onChange={(e) => setUsuario(e.target.value)} required 
            disabled={mostrarModal} />
        </div>

        <div className="campo">
          <label htmlFor="password">Contraseña:</label>
          <input id="password" type="password" placeholder="Ingresa tu contraseña"
            value={password} onChange={(e) => setPassword(e.target.value)} required 
            disabled={mostrarModal} />
        </div>

        <div className="campo">
          <label htmlFor="correo">Correo:</label>
          <input id="correo" type="email" placeholder="Ingresa tu correo"
            value={correo} onChange={(e) => setCorreo(e.target.value)} required 
            disabled={mostrarModal} />
        </div>

        <button className="btn-entrar" type="submit" disabled={cargando || mostrarModal}>
          {cargando && !mostrarModal ? 'Validando...' : 'Entrar'}
        </button>

        {!mostrarModal && mensaje.texto && (
          <p className={`mensaje ${mensaje.error ? 'error' : ''}`}>
            {mensaje.texto}
          </p>
        )}
      </form>

      {mostrarModal && (
        <div style={overlayStyle}>
          <form className="formulario" style={modalFormStyle} onSubmit={handleSubmitCodigo}>
            <h2>Verificación de Seguridad</h2>
            <p style={{ textAlign: 'center', marginBottom: '15px' }}>
              Ingresa el código enviado a <strong>{correo}</strong>
            </p>
            
            <div className="campo">
              <label htmlFor="codigo">Código de 6 dígitos:</label>
              <input id="codigo" type="text" placeholder="Ej. 123456"
                value={codigo} onChange={(e) => setCodigo(e.target.value)} required 
                autoFocus />
            </div>

            <button className="btn-entrar" type="submit" disabled={cargando}>
              {cargando ? 'Verificando...' : 'Confirmar Código'}
            </button>
            
            <button type="button" className="btn-volver" onClick={() => setMostrarModal(false)} 
              style={{ marginTop: '10px', background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' }}>
              Cancelar
            </button>

            {mensaje.texto && (
              <p className={`mensaje ${mensaje.error ? 'error' : ''}`}>
                {mensaje.texto}
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalFormStyle = {
  backgroundColor: '#fff',
  padding: '30px',
  borderRadius: '10px',
  boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
  width: '90%',
  maxWidth: '400px',
  zIndex: 1001
};

export default App;