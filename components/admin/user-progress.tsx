import { Progress } from "@/components/ui/progress"

interface UserProgressProps {
  progress: number
}

export function UserProgress({ progress }: UserProgressProps) {
  return (
    <div className="flex items-center gap-2">
      <Progress value={progress} className="h-2 w-[60px]" />
      <span className="text-sm text-muted-foreground">{progress}%</span>
    </div>
  )
}

