import React, { useState } from 'react'
import { Eye, EyeOff, User, Lock, Loader, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface LoginFormProps {
  onLoginSuccess?: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { login, loading, error } = useAuth()
  const [formData, setFormData] = useState({
    identifiant: '',
    motDePasse: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})

  const validateForm = () => {
    const errors: {[key: string]: string} = {}

    if (!formData.identifiant.trim()) {
      errors.identifiant = 'L\'identifiant est requis'
    }

    if (!formData.motDePasse) {
      errors.motDePasse = 'Le mot de passe est requis'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const success = await login(formData.identifiant, formData.motDePasse)
    
    if (success && onLoginSuccess) {
      onLoginSuccess()
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-club-red via-red-600 to-red-800 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-club-red" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Connexion Admin
          </h2>
          <p className="text-red-100">
            Accédez au tableau de bord d'administration
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Global Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Identifiant Field */}
            <div>
              <label htmlFor="identifiant" className="block text-sm font-medium text-gray-700 mb-2">
                Identifiant
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="identifiant"
                  type="text"
                  value={formData.identifiant}
                  onChange={(e) => handleInputChange('identifiant', e.target.value)}
                  className={`input-field pl-10 ${
                    validationErrors.identifiant ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="Votre identifiant"
                  disabled={loading}
                />
              </div>
              {validationErrors.identifiant && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.identifiant}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="motDePasse"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.motDePasse}
                  onChange={(e) => handleInputChange('motDePasse', e.target.value)}
                  className={`input-field pl-10 pr-10 ${
                    validationErrors.motDePasse ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="Votre mot de passe"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {validationErrors.motDePasse && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.motDePasse}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-club-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-club-red transition-all duration-200 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Comptes de démonstration :</h4>
            <div className="text-xs text-blue-800 space-y-1">
              <p><strong>Admin :</strong> admin / admin123</p>
              <p><strong>Joueur :</strong> player1 / password</p>
              <p><strong>Staff :</strong> staff1 / staff123</p>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              * Ces comptes doivent être créés dans la base de données Supabase
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-red-100 text-sm">
            Système d'administration sécurisé avec Supabase
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
