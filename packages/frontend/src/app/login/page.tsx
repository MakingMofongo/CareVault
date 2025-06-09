'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, User, Stethoscope, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

type UserRole = 'doctor' | 'patient';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('doctor');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password, role);
      toast.success(`Welcome back!`);
    } catch (error: any) {
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (userRole: UserRole) => {
    if (userRole === 'doctor') {
      setEmail('doctor@carevault.com');
      setPassword('doctor123');
      setRole('doctor');
    } else {
      setEmail('patient@carevault.com');
      setPassword('patient123');
      setRole('patient');
    }
  };

  const fillDemoPatient = (patient: 'john' | 'jane') => {
    if (patient === 'john') {
      setEmail('john.doe@example.com');
      setPassword('patient123');
      setRole('patient');
    } else {
      setEmail('jane.smith@example.com');
      setPassword('patient123');
      setRole('patient');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center justify-center mb-8">
              <Shield className="h-12 w-12 text-primary" />
              <span className="ml-3 text-3xl font-bold gradient-text">CareVault</span>
            </Link>
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-muted-foreground mt-2">
              Enter your credentials to access your account
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">Sign in</CardTitle>
              <CardDescription>
                Choose your role and enter your credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Role selector */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={role === 'doctor' ? 'default' : 'outline'}
                  className="relative h-24 flex-col space-y-2"
                  onClick={() => setRole('doctor')}
                >
                  <Stethoscope className="h-8 w-8" />
                  <span>Doctor</span>
                </Button>
                <Button
                  type="button"
                  variant={role === 'patient' ? 'default' : 'outline'}
                  className="relative h-24 flex-col space-y-2"
                  onClick={() => setRole('patient')}
                >
                  <User className="h-8 w-8" />
                  <span>Patient</span>
                </Button>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3 pt-2">
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Demo credentials
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillCredentials('doctor')}
                  className="text-xs"
                >
                  Demo Doctor
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoPatient('john')}
                  className="text-xs"
                >
                  John Doe (Patient)
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoPatient('jane')}
                  className="text-xs"
                >
                  Jane Smith (Patient)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillCredentials('patient')}
                  className="text-xs"
                >
                  Demo Patient
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image/gradient */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-primary via-secondary to-primary">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white">
          <h1 className="text-4xl font-bold mb-6 text-center">
            Transforming Healthcare Delivery
          </h1>
          <p className="text-xl text-center max-w-md opacity-90">
            Experience the future of clinical workflow with AI-powered decision support 
            and seamless prescription management.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-6 text-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="font-semibold mb-1">For Doctors</div>
              <div className="opacity-80">AI-assisted prescriptions</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="font-semibold mb-1">For Patients</div>
              <div className="opacity-80">Secure health records</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="font-semibold mb-1">For Pharmacies</div>
              <div className="opacity-80">Instant verification</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="font-semibold mb-1">For Everyone</div>
              <div className="opacity-80">Better healthcare</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}