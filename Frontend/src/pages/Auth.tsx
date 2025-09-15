import React, { useState, useEffect } from "react"
import { useNavigate, useSearchParams, useLocation } from "react-router-dom"
import { useIsMobile } from "@/hooks/use-mobile"
import { SEO } from "@/components/SEO"
import { useAuth } from "@/contexts/AuthContext"
import { useUserData } from "@/hooks/useUserData"
import {
  AuthHeroSection,
  AuthMobileHero,
  AuthRoleSelection,
  AuthMobileRoleSelection,
  AuthForm
} from "@/components/auth"

export default function Auth() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [collegeName, setCollegeName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formStep, setFormStep] = useState(1)
  const [showMobileForm, setShowMobileForm] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'student' | 'admin' | 'teacher' | 'parent' | null>(null)
  const [showRoleSelection, setShowRoleSelection] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { updateUserData } = useUserData()
  const [searchParams] = useSearchParams()
  
  // Check URL params for mode (default to login)
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup')
  
  const isMobile = useIsMobile()

  // Update URL when mode changes
  useEffect(() => {
    const currentParams = new URLSearchParams(searchParams)
    if (isSignUp) {
      currentParams.set('mode', 'signup')
    } else {
      currentParams.delete('mode')
    }
    navigate(`/auth?${currentParams.toString()}`, { replace: true })
  }, [isSignUp, navigate, searchParams])

  // Check if we should show mobile form based on URL params
  useEffect(() => {
    if (searchParams.get('form') === 'true') {
      setShowMobileForm(true)
    }
  }, [searchParams])



  const API_URL = "http://localhost:5000/api/auth" // change when you deploy

        const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            let response;
            if (isSignUp) {
            // Register API
            response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                name,
                email,
                password,
                collegeName,
                role: selectedRole ?? "student",
                }),
            })
            } else {
            // Login API
            response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                email,
                password,
                role: selectedRole ?? "student",
                }),
            })
            }

            const data = await response.json()
            if (!response.ok) throw new Error(data.message || "Auth failed")

            // 🔑 Save JWT token
            if (data.token) {
            localStorage.setItem("token", data.token)
            }

            // 👤 Update frontend state
            updateUserData({
            name: data.user?.name || name,
            email: data.user?.email || email,
            course: data.user?.collegeName || collegeName,
            })
            login(data.user)

            // Redirect based on role
            const role = data.user?.role || selectedRole
            const panelPath =
            role === "admin" ? "/admin/profile" :
            role === "teacher" ? "/teacher/profile" : "/"

            navigate(panelPath, { replace: true })
        } catch (error) {
            console.error("Auth error:", error)
        } finally {
            setIsLoading(false)
        }
        }

  const nextStep = () => {
    if (isSignUp && formStep === 1) {
      setFormStep(2)
    }
  }

  const prevStep = () => {
    if (formStep === 2) {
      setFormStep(1)
    }
  }

  const handleRoleSelect = (role: 'student' | 'admin' | 'teacher' | 'parent') => {
    setSelectedRole(role)
    setIsSignUp(false)
    if (isMobile) {
      setShowMobileForm(true)
    }
  }

  const handleMobileBack = () => {
    if (selectedRole) {
      setShowRoleSelection(true)
      setShowMobileForm(false)
    } else {
      setShowMobileForm(false)
    }
  }

  // Mobile view
  if (isMobile) {
    // Show role selection first, then hero section, then form
    if (!showRoleSelection && !showMobileForm) {
      return (
        <>
          <SEO 
            title="Welcome to CampusSync"
            description="Transform your academic journey with our comprehensive student management platform."
            keywords="student login, campus sync, academic platform, student management, university app"
          />
          
          <AuthMobileHero onGetStarted={() => setShowRoleSelection(true)} />
        </>
      )
    }

    // Mobile role selection view
    if (showRoleSelection && !showMobileForm) {
      return (
        <>
          <SEO 
            title="Choose Your Role - CampusSync"
            description="Select your role to access the appropriate features for students, teachers, administrators, or parents."
            keywords="user roles, student login, teacher portal, admin access, parent dashboard"
          />
          
          <AuthMobileRoleSelection
            onBack={() => setShowRoleSelection(false)}
            onRoleSelect={handleRoleSelect}
          />
        </>
      )
    }

    // Mobile form view
    return (
      <>
        <SEO 
          title={isSignUp ? "Create Account" : "Sign In"}
          description={isSignUp ? "Join CampusSync and transform your academic journey with our comprehensive student management platform." : "Welcome back to CampusSync. Continue your academic journey."}
          keywords="student login, campus sync, academic platform, student management, university app"
        />
        
        <AuthForm
          isSignUp={isSignUp}
          setIsSignUp={(value) => {
            setIsSignUp(value);
            setFormStep(1);
          }}
          formStep={formStep}
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          collegeName={collegeName}
          setCollegeName={setCollegeName}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          isLoading={isLoading}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          onSubmit={handleSubmit}
          nextStep={nextStep}
          prevStep={prevStep}
          isMobile={true}
          onBack={handleMobileBack}
        />
      </>
    )
  }

  // Desktop view
  return (
    <>
      <SEO 
        title={isSignUp ? "Create Account" : "Sign In"}
        description={isSignUp ? "Join CampusSync and transform your academic journey with our comprehensive student management platform." : "Welcome back to CampusSync. Continue your academic journey."}
        keywords="student login, campus sync, academic platform, student management, university app"
      />
      
      <div className="min-h-screen flex flex-col lg:flex-row">
        <AuthHeroSection />
        <div className="lg:w-1/2 flex items-center justify-center p-4 lg:p-6 xl:p-8 bg-background">
          <div className="w-full max-w-md space-y-8">
            {!selectedRole ? (
              <>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl lg:text-3xl font-bold tracking-tight">Choose Your Role</h3>
                  <p className="text-muted-foreground">Select the option that best describes you</p>
                </div>
                <AuthRoleSelection onRoleSelect={handleRoleSelect} />
              </>
            ) : (
              <AuthForm
                isSignUp={isSignUp}
                setIsSignUp={(value) => {
                  setIsSignUp(value);
                  setFormStep(1);
                }}
                formStep={formStep}
                name={name}
                setName={setName}
                email={email}
                setEmail={setEmail}
                collegeName={collegeName}
                setCollegeName={setCollegeName}
                password={password}
                setPassword={setPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                isLoading={isLoading}
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                onSubmit={handleSubmit}
                nextStep={nextStep}
                prevStep={prevStep}
                isMobile={false}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}