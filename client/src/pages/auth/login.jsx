import React, {useState} from 'react'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import './login.css'
import {loginRequest} from '../../helper_module/authHelper'

const Login = () => {

    const ROLES = ['ADMIN', 'MANAGER', 'EMPLOYEE'];

    const[email,setEmail] = useState("")
    const[password,setPassword] = useState("")
    const [selectedRole, setSelectedRole] = useState('');

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    try {
        const data = await loginRequest({
        email,
        password,
        role: selectedRole
      });

      if (data?.token) {
        localStorage.setItem('token', data.token);
        }
      localStorage.setItem('role', selectedRole);

      toast.success('login success');

      const routeByRole = {
        ADMIN: '/admin_dashboard',
        MANAGER: '/manager_dashboard',
        EMPLOYEE: '/employee_dashboard'
        };

        navigate(routeByRole[selectedRole]);
        setEmail('');
        setPassword('');
        } catch (error) {
        toast.error(error?.message || 'login failed');
        } 
    };

  return (

    <>
    
    <div className="auth-container">
        <div className="card">
            <h1>LOGIN</h1>
            {/* email field */}
            
            <form onSubmit={handleSubmit}>
            <div className="username-field mb-4">
                <h5><i className="fa-solid fa-user"></i> Email ID</h5>

                <input type="email" placeholder="Enter your Email ID" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            {/* password field */}
            <div className="password-field mb-3">
                <h5><i className="fa-solid fa-lock"></i> Password</h5>

                <input type="password" placeholder="Enter password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <div className="role-buttons" role="group" aria-label="Select role">
            {ROLES.map((role) => (
              <button
                key={role}
                type="button"
                className="role-button"
                onClick={() => setSelectedRole(role)}
                aria-pressed={selectedRole === role}
                style={{
                  backgroundColor: selectedRole === role ? '#3776fd' : '#fff',
                  color: selectedRole === role ? '#fff' : '#1f2a44',
                  borderColor: selectedRole === role ? '#3776fd' : '#333'
                }}
              >
                {role}
              </button>
            ))}
          </div>

            


            {/* button */}
            <button 
            type="submit"
            className="btn btn-primary login-btn"
            disabled={!email || !password || !selectedRole}
            
            >
            LOGIN
            </button>
            </form>
        </div>
        
    </div>
    
    </>
  )
}

export default Login