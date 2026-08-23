import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

interface Transaction {
  id: string;
  price: number;
  createdAt: string;
  user: { email: string };
  vehicle: { make: string; model: string; category: string };
}

interface AnalyticsStats {
  revenue: number;
  salesCount: number;
  lowStockCount: number;
}

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<AnalyticsStats>({ revenue: 0, salesCount: 0, lowStockCount: 0 });
  const [searchMake, setSearchMake] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  
  // New Vehicle Form State
  const [newMake, setNewMake] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newQuantity, setNewQuantity] = useState('');

  useEffect(() => {
    if (token) {
      fetchVehicles();
      fetchTransactions();
      fetchStats();
    }
  }, [token]);

  const fetchVehicles = async () => {
    try {
      const res = await axios.get(`${API_BASE}/vehicles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/vehicles/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/analytics/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isRegistering ? '/auth/register' : '/auth/login';
    try {
      const res = await axios.post(`${API_BASE}${endpoint}`, { email, password, role: 'USER' });
      if (!isRegistering) {
        setToken(res.data.token);
        setRole(res.data.role);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
      } else {
        alert('Registration successful! Please log in.');
        setIsRegistering(false);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Authentication failed');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    localStorage.clear();
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE}/vehicles`,
        { make: newMake, model: newModel, category: newCategory, price: newPrice, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMake(''); setNewModel(''); setNewCategory(''); setNewPrice(''); setNewQuantity('');
      fetchVehicles();
      fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add vehicle');
    }
  };

  const handlePurchase = async (id: string) => {
    try {
      await axios.post(`${API_BASE}/vehicles/${id}/purchase`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchVehicles();
      fetchTransactions();
      fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Purchase failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_BASE}/vehicles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchVehicles();
      fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed (Admin required)');
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.make.toLowerCase().includes(searchMake.toLowerCase()) &&
    v.category.toLowerCase().includes(searchCategory.toLowerCase())
  );

  if (!token) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>{isRegistering ? 'Register Account' : 'Dealership Login'}</h2>
        <form onSubmit={handleAuth}>
          <div style={{ marginBottom: '10px' }}>
            <label>Email: </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Password: </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: '15px', cursor: 'pointer', color: 'blue' }} onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>🏎️ Car Dealership Portal</h1>
        <div>
          <span>Role: <strong>{role}</strong> </span>
          <button onClick={handleLogout} style={{ marginLeft: '10px', padding: '5px 10px' }}>Logout</button>
        </div>
      </header>

      {/* Analytics KPI Dashboard */}
      <section style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', flex: 1, textAlign: 'center', border: '1px solid #e9ecef' }}>
          <h4 style={{ margin: 0, color: '#6c757d' }}>Total Revenue</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#28a745', margin: '0.5rem 0 0 0' }}>
            ${stats.revenue.toLocaleString()}
          </p>
        </div>
        
        <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', flex: 1, textAlign: 'center', border: '1px solid #e9ecef' }}>
          <h4 style={{ margin: 0, color: '#6c757d' }}>Vehicles Sold</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#17a2b8', margin: '0.5rem 0 0 0' }}>
            {stats.salesCount}
          </p>
        </div>

        <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', flex: 1, textAlign: 'center', border: '1px solid #e9ecef' }}>
          <h4 style={{ margin: 0, color: '#6c757d' }}>Low Stock Alerts</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#dc3545', margin: '0.5rem 0 0 0' }}>
            {stats.lowStockCount}
          </p>
        </div>
      </section>

      {/* Admin Vehicle Addition Form */}
      <section style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
        <h3>Add New Vehicle</h3>
        <form onSubmit={handleAddVehicle} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <input placeholder="Make" value={newMake} onChange={e => setNewMake(e.target.value)} required />
          <input placeholder="Model" value={newModel} onChange={e => setNewModel(e.target.value)} required />
          <input placeholder="Category" value={newCategory} onChange={e => setNewCategory(e.target.value)} required />
          <input placeholder="Price" type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} required />
          <input placeholder="Quantity" type="number" value={newQuantity} onChange={e => setNewQuantity(e.target.value)} required />
          <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>Add Vehicle</button>
        </form>
      </section>

      {/* Filter Section */}
      <section style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input placeholder="Search Make..." value={searchMake} onChange={e => setSearchMake(e.target.value)} style={{ padding: '8px', flex: 1 }} />
        <input placeholder="Search Category..." value={searchCategory} onChange={e => setSearchCategory(e.target.value)} style={{ padding: '8px', flex: 1 }} />
      </section>

      {/* Vehicle Inventory Table */}
      <h3>Available Vehicles</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', marginBottom: '30px' }}>
        <thead>
          <tr style={{ background: '#343a40', color: 'white', textAlign: 'left' }}>
            <th style={{ padding: '10px' }}>Make</th>
            <th>Model</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredVehicles.map(v => (
            <tr key={v.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{v.make}</td>
              <td>{v.model}</td>
              <td>{v.category}</td>
              <td>${v.price.toLocaleString()}</td>
              <td>{v.quantity}</td>
              <td>
                <button onClick={() => handlePurchase(v.id)} disabled={v.quantity <= 0} style={{ marginRight: '5px', padding: '5px 10px' }}>
                  {v.quantity > 0 ? 'Buy' : 'Out of Stock'}
                </button>
                {role === 'ADMIN' && (
                  <button onClick={() => handleDelete(v.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px' }}>
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Transaction Audit History Table */}
      <h3>📜 Purchase Audit Log</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ background: '#17a2b8', color: 'white', textAlign: 'left' }}>
            <th style={{ padding: '10px' }}>User</th>
            <th>Vehicle</th>
            <th>Price</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{t.user?.email || 'N/A'}</td>
              <td>{t.vehicle ? `${t.vehicle.make} ${t.vehicle.model}` : 'Deleted Vehicle'}</td>
              <td>${t.price.toLocaleString()}</td>
              <td>{new Date(t.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}