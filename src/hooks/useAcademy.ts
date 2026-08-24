import { useContext } from 'react'
import { AcademyContext, type AcademyContextValue } from '../context/AcademyContext'

export function useAcademy(): AcademyContextValue {
  const context = useContext(AcademyContext)
  if (!context) {
    throw new Error('useAcademy must be used within AcademyProvider')
  }
  return context
}
