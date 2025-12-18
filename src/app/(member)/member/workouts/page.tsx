import { getWorkouts } from "@/actions/workout-actions"
import { WorkoutList } from "./client"

export default async function WorkoutsPage() {
    const workouts = await getWorkouts()

    return <WorkoutList workouts={workouts} />
}
