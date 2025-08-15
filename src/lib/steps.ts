import { Step, StepType } from '@/types'

export function parseXml(response: string): Step[] {
    // Extract the XML content between <boltArtifact> tags
    const xmlMatch = response.match(/<boltArtifact[^>]*>([\s\S]*?)<\/boltArtifact>/)
    
    if (!xmlMatch) {
      return []
    }
  
    const xmlContent = xmlMatch[1]
    const steps: Step[] = []
    let stepId = 1
  
    // Extract artifact title
    const titleMatch = response.match(/title="([^"]*)"/)
    const artifactTitle = titleMatch ? titleMatch[1] : 'Project Files'
  
    // Add initial artifact step
    steps.push({
      id: stepId++,
      title: artifactTitle,
      description: '',
      type: StepType.CreateFolder,
      status: 'pending'
    })
  
    // Regular expression to find boltAction elements
    const actionRegex = /
}