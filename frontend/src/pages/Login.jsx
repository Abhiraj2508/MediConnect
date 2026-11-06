import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate, useLocation } from 'react-router-dom'

const Login = () => {

  const [state, setState] = useState('Sign Up')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { backendUrl, token, setToken, userData } = useContext(AppContext)

  useEffect(() => {
    if (location.state?.mode === 'login') {
      setState('Login')
    } else if (location.state?.mode === 'signup') {
      setState('Sign Up')
    }
  }, [location.state])

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (loading) return;

    try {
      setLoading(true)

      if (state === 'Sign Up') {
        const trimmedName = name.trim()
        const trimmedEmail = email.trim()

        if (!trimmedName) {
          toast.error('Please enter your full name')
          setLoading(false)
          return
        }

        if (password.length < 8) {
          toast.error('Password must be at least 8 characters')
          setLoading(false)
          return
        }

        const { data } = await axios.post(backendUrl + '/api/user/register', { 
          name: trimmedName, 
          email: trimmedEmail, 
          password 
        })

        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success(data.message || 'Account created successfully!')
          navigate('/')
        } else {
          toast.error(data.message)
        }

      } else {

        const trimmedEmail = email.trim()

        const { data } = await axios.post(backendUrl + '/api/user/login', { 
          email: trimmedEmail, 
          password 
        })

        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success(data.message || 'Logged in successfully!')
          navigate('/')
        } else {
          toast.error(data.message)
        }

      }
    } catch (error) {
      console.error('Authentication error:', error)
      toast.error(
        error.response?.data?.message || 
        error.message || 
        'Failed to connect to the server. Please check your backend connection.'
      )
    } finally {
      setLoading(false)
    }

  }

  useEffect(() => {
    if (token && userData) {
      navigate('/')
    }
  }, [token, userData, navigate])

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
        <p>Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book appointment</p>
        {state === 'Sign Up'
          ? <div className='w-full '>
            <p>Full Name</p>
            <input onChange={(e) => setName(e.target.value)} value={name} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="text" required placeholder="John Doe" />
          </div>
          : null
        }
        <div className='w-full '>
          <p>Email</p>
          <input onChange={(e) => setEmail(e.target.value)} value={email} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="email" required placeholder="name@example.com" />
        </div>
        <div className='w-full '>
          <p>Password</p>
          <input onChange={(e) => setPassword(e.target.value)} value={password} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="password" minLength={8} required placeholder="Minimum 8 characters" />
        </div>
        <button disabled={loading} className='bg-primary text-white w-full py-2 my-2 rounded-md text-base disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition-opacity'>
          {loading ? 'Please wait...' : (state === 'Sign Up' ? 'Create account' : 'Login')}
        </button>
        {state === 'Sign Up'
          ? <p>Already have an account? <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer'>Login here</span></p>
          : <p>Create a new account? <span onClick={() => setState('Sign Up')} className='text-primary underline cursor-pointer'>Click here</span></p>
        }
      </div>
    </form>
  )
}

export default Login