import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface OnboardingBusinessData {
  name: string
  type: string
  npwp: string
  email: string
  phone: string
  address: string
  province: string
  city: string
  district: string
  subdistrict: string
  postalCode: string
  logo: string | null
}

export interface OnboardingPlanData {
  plan: string
}

export interface OnboardingOutletData {
  hasMultiOutlet: boolean
  outlets: Array<{
    name: string
    address: string
    city: string
    phone: string
  }>
}

export interface OnboardingOperationsData {
  openTime: string
  closeTime: string
  taxRate: number
  serviceRate: number
  currency: string
}

interface OnboardingStore {
  business: Partial<OnboardingBusinessData>
  plan: Partial<OnboardingPlanData>
  outlet: Partial<OnboardingOutletData>
  operations: Partial<OnboardingOperationsData>
  
  setBusiness: (data: Partial<OnboardingBusinessData>) => void
  setPlan: (data: Partial<OnboardingPlanData>) => void
  setOutlet: (data: Partial<OnboardingOutletData>) => void
  setOperations: (data: Partial<OnboardingOperationsData>) => void
  
  clearAll: () => void
}

export const useOnboardingStore = create<OnboardingStore>()(persist(
  (set) => ({
    business: {},
    plan: {},
    outlet: {},
    operations: {},
    
    setBusiness: (data) => set((state) => ({ 
      business: { ...state.business, ...data } 
    })),
    
    setPlan: (data) => set((state) => ({ 
      plan: { ...state.plan, ...data } 
    })),
    
    setOutlet: (data) => set((state) => ({ 
      outlet: { ...state.outlet, ...data } 
    })),
    
    setOperations: (data) => set((state) => ({ 
      operations: { ...state.operations, ...data } 
    })),
    
    clearAll: () => set({ 
      business: {}, 
      plan: {}, 
      outlet: {}, 
      operations: {} 
    }),
  }),
  {
    name: 'bayaro-onboarding-storage',
  }
))
