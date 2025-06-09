"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function Breadcrumbs() {
  const pathname = usePathname()
  const { user } = useAuth()
  
  // Don't show breadcrumbs on landing page or auth pages
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return null
  }

  const pathSegments = pathname.split("/").filter(Boolean)
  
  const generateBreadcrumbs = () => {
    const breadcrumbs = []
    
    // Add home based on user role
    if (user) {
      breadcrumbs.push({
        label: user.role === "doctor" ? "Doctor Dashboard" : "Patient Dashboard",
        href: user.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard",
        icon: <Home className="h-4 w-4" />
      })
    }
    
    // Build breadcrumbs from path
    let currentPath = ""
    for (let i = 0; i < pathSegments.length; i++) {
      currentPath += `/${pathSegments[i]}`
      
      // Skip the first segment if it's role-based (doctor/patient)
      if (i === 0 && (pathSegments[i] === "doctor" || pathSegments[i] === "patient")) {
        continue
      }
      
      // Skip dashboard as it's already added as home
      if (pathSegments[i] === "dashboard") {
        continue
      }
      
      const isLast = i === pathSegments.length - 1
      const label = formatLabel(pathSegments[i])
      
      breadcrumbs.push({
        label,
        href: isLast ? null : currentPath,
        isLast
      })
    }
    
    return breadcrumbs
  }
  
  const formatLabel = (segment: string) => {
    switch (segment) {
      case "appointments": return "Appointments"
      case "patients": return "Patients"
      case "prescriptions": return "Prescriptions"
      case "new": return "New"
      case "dashboard": return "Dashboard"
      default: return segment.charAt(0).toUpperCase() + segment.slice(1)
    }
  }
  
  const breadcrumbs = generateBreadcrumbs()
  
  if (breadcrumbs.length <= 1) {
    return null
  }
  
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
          {crumb.href ? (
            <Link 
              href={crumb.href}
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              {crumb.icon}
              {crumb.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium flex items-center gap-1">
              {crumb.icon}
              {crumb.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
} 