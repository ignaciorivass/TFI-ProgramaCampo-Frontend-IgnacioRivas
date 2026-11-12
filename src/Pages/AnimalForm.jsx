import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const AnimalForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);

  const [animales, setAnimales] = useState([]);
  const [potreros, setPotreros] = useState([]);
  const [form, setForm] = useState({
    caravana: '',
    especie: 'Bovino',
    raza: '',
    sexo: '',
    fecha_nacimiento: '',
    peso: '',
    origen: 'Compra',
    madre_id: '',
    padre_id: '',
    potrero_id: '',
    estado: 'Activo'
  });

  useEffect(() => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    axios.get('http://localhost:3000/api/animales', config).then(res => setAnimales(res.data));
    axios.get('http://localhost:3000/api/potreros', config).then(res => setPotreros(res.data));

    if (id) {
      axios.get(`http://localhost:3000/api/animales/${id}`, config).then(res => {
        const data = res.data;
        setForm({
          ...data,
          fecha_nacimiento: data.fecha_nacimiento ? data.fecha_nacimiento.split('T')[0] : '',
          madre_id: data.madre_id || '',
          padre_id: data.padre_id || '',
          potrero_id: data.potrero_id || ''
        });
      });
    }
  }, [id, token]);

  const handleCaravanaChange = (e) => {
    const valor = e.target.value.toUpperCase();
    const borrando = valor.length < form.caravana.length;
    const limpio = valor.replace(/[^A-Z0-9]/g, '');

    const letras = (limpio.match(/^[A-Z]{0,2}/) || [''])[0];
    const numeros = limpio.slice(letras.length).replace(/[^0-9]/g, '').slice(0, 6);

    let formateado = letras;
    if (letras.length === 2 && (numeros.length > 0 || !borrando)) {
      formateado = `${letras}-${numeros}`;
    }

    setForm({ ...form, caravana: formateado });
  };

  const handleRazaChange = (e) => {
    const soloLetras = e.target.value
      .replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '')
      .replace(/\s{2,}/g, ' ');
    setForm({ ...form, raza: soloLetras });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const duplicada = animales.some(
      a => a.caravana.toUpperCase() === form.caravana.toUpperCase() && a.id !== Number(id)
    );
    if (duplicada) {
      alert(`Ya existe un animal registrado con la caravana ${form.caravana}.`);
      return;
    }

    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      if (id) {
        await axios.put(`http://localhost:3000/api/animales/${id}`, form, config);
      } else {
        await axios.post('http://localhost:3000/api/animales', form, config);
      }
      navigate('/animales');
    } catch (error) {
      alert(error.response?.data?.error || 'Error al guardar el animal');
    }
  };

  const hembras = animales.filter(a => a.sexo === 'Hembra' && a.id !== Number(id));
  const machos = animales.filter(a => a.sexo === 'Macho' && a.id !== Number(id));

  return (
    <div className="card shadow mt-4 mx-auto" style={{ maxWidth: '700px' }}>
      <div className="card-body">
        <h3 className="text-success mb-3">{id ? 'Modificar Animal' : 'Registrar Animal / Nacimiento'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col">
              <label>Caravana (Código):</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: AR-105"
                maxLength={9}
                pattern="^[A-Z]{2}-[0-9]{3,6}$"
                title="Formato requerido: 2 letras, un guion y entre 3 y 6 números (Ej: AR-105)"
                value={form.caravana}
                onChange={handleCaravanaChange}
                required
              />
            </div>
            <div className="col">
              <label>Sexo:</label>
              <select
                className="form-select"
                value={form.sexo}
                onChange={e => setForm({ ...form, sexo: e.target.value })}
                required
              >
                <option value="">Seleccione...</option>
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col">
              <label>Especie:</label>
              <select
                className="form-select"
                value={form.especie}
                onChange={e => setForm({ ...form, especie: e.target.value })}
              >
                <option value="Bovino">Bovino</option>
                <option value="Ovino">Ovino</option>
                <option value="Equino">Equino</option>
                <option value="Porcino">Porcino</option>
              </select>
            </div>
            <div className="col">
              <label>Raza:</label>
              <input
                type="text"
                list="razas-sugeridas"
                className="form-control"
                placeholder="Ej: Aberdeen Angus, Hereford..."
                value={form.raza}
                onChange={handleRazaChange}
                minLength={3}
                maxLength={40}
                pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ]+(\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*"
                title="Ingrese solo letras (mínimo 3 caracteres, sin números ni símbolos)"
                required
              />
              <datalist id="razas-sugeridas">
                <option value="Aberdeen Angus" />
                <option value="Hereford" />
                <option value="Braford" />
                <option value="Brangus" />
                <option value="Holando Argentino" />
                <option value="Criollo" />
                <option value="Merino" />
                <option value="Cuarto de Milla" />
              </datalist>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col">
              <label>Origen:</label>
              <select
                className="form-select"
                value={form.origen}
                onChange={e => setForm({ ...form, origen: e.target.value })}
              >
                <option value="Compra">Compra / Ingreso</option>
                <option value="Nacimiento">Nacimiento en el campo</option>
              </select>
            </div>
            <div className="col">
              <label>Fecha de Nacimiento:</label>
              <input
                type="date"
                className="form-control"
                value={form.fecha_nacimiento}
                onChange={e => setForm({ ...form, fecha_nacimiento: e.target.value })}
                required
              />
            </div>
          </div>

          {form.origen === 'Nacimiento' && (
            <div className="row mb-3 p-2 bg-light border rounded">
              <div className="col">
                <label className="fw-bold text-success">Madre (Hembra):</label>
                <select
                  className="form-select"
                  value={form.madre_id}
                  onChange={e => setForm({ ...form, madre_id: e.target.value })}
                >
                  <option value="">Sin especificar...</option>
                  {hembras.map(h => (
                    <option key={h.id} value={h.id}>{h.caravana} ({h.raza})</option>
                  ))}
                </select>
              </div>
              <div className="col">
                <label className="fw-bold text-success">Padre (Macho):</label>
                <select
                  className="form-select"
                  value={form.padre_id}
                  onChange={e => setForm({ ...form, padre_id: e.target.value })}
                >
                  <option value="">Sin especificar...</option>
                  {machos.map(m => (
                    <option key={m.id} value={m.id}>{m.caravana} ({m.raza})</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="row mb-3">
            <div className="col">
              <label>Potrero Asignado:</label>
              <select
                className="form-select"
                value={form.potrero_id}
                onChange={e => setForm({ ...form, potrero_id: e.target.value })}
              >
                <option value="">Sin asignar...</option>
                {potreros.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div className="col">
              <label>Peso Inicial / Actual (kg):</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                value={form.peso}
                onChange={e => setForm({ ...form, peso: e.target.value })}
                required
              />
            </div>
            <div className="col">
              <label>Estado:</label>
              <select
                className="form-select"
                value={form.estado}
                onChange={e => setForm({ ...form, estado: e.target.value })}
              >
                <option value="Activo">Activo</option>
                <option value="Vendido">Vendido</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-success">Guardar</button>
          <button type="button" onClick={() => navigate('/animales')} className="btn btn-secondary ms-2">Cancelar</button>
        </form>
      </div>
    </div>
  );
};

export default AnimalForm;