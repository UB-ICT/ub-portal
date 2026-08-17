import { faker } from "@faker-js/faker"
import type { UBCalendarCategory } from "./UBCalendarView"
import type { UBFullCalendarEvent } from "./UBFullCalendarView"
import type { UBListEventViewProps } from "./UBListEventView"

// Keep reproducible data on reloads (optional)
faker.seed(2026)

export const sharedCalendarCategories: UBCalendarCategory[] = [
  { id: "academic", label: "Academic", color: "#5b2db8" },
  { id: "sports", label: "Sports", color: "#e0a702" },
  { id: "career", label: "Career", color: "#3b82f6" },
  { id: "cultural", label: "Cultural", color: "#ec4899" },
  { id: "research", label: "Research", color: "#10b981" },
  { id: "workshop", label: "Workshop", color: "#f97316" },
]

// Domain pools for realistic UB/Belize mock data
const locations = [
  "Main Campus Auditorium",
  "Open Air Theatre",
  "Belize Marine Institute",
  "FMNS Courtyard",
  "FST Computer Lab B",
  "Faculty of Education Hall",
  "Marion Jones Stadium",
  "Calabash Caye Field Station",
  "Belmopan Campus Grounds",
]

const eventTitles = [
  "Spring Semester Orientation",
  "Belize Arts and Heritage Showcase",
  "Marine Research Methods Symposium",
  "Career Readiness Bootcamp",
  "Workshop: Intro to Machine Learning with Python",
  "Open Lecture: Indigenous Knowledge in Modern Curricula",
  "Jaguars vs. UWI Pelicans - CFU Semifinal",
  "Garifuna Settlement Day Cultural Night",
  "Summer Coding Lab",
  "Interfaculty Athletics Meet",
  "Faculty Research Colloquium",
  "Belize Tech and Tourism Career Fair",
  "Calabash Caye Field Day",
  "End of Year Cultural Festival",
]

const secondaryCategories = [
  "UB Computing Society",
  "Faculty of Education",
  "UB Cultural Council",
  "Faculty of Science and Technology",
  "Student Government Association",
]

// 1. Generate full calendar events across the year 2026
export const sharedCalendarEvents: UBFullCalendarEvent[] = Array.from(
  { length: 14 },
  (_, index) => {
    const category = faker.helpers.arrayElement(sharedCalendarCategories)
    const randomDate = faker.date.between({
      from: "2026-01-01",
      to: "2026-12-31",
    })

    return {
      id: `e-${index + 1}`,
      date: randomDate.toISOString().split("T")[0],
      categoryId: category.id,
      title: faker.helpers.arrayElement(eventTitles),
      time: `${faker.number.int({ min: 8, max: 19 }).toString().padStart(2, "0")}:00`,
      location: faker.helpers.arrayElement(locations),
      secondaryActionLabel: "Add to Google Calendar",
    }
  }
)

// 2. Generate list view events
export const sharedListEvents: UBListEventViewProps["events"] = Array.from(
  { length: 3 },
  (_, index) => {
    const date = faker.date.between({ from: "2026-05-01", to: "2026-06-30" })
    const category = faker.helpers.arrayElement(sharedCalendarCategories)

    return {
      id: `event-${index + 1}`,
      month: date.toLocaleString("en-US", { month: "short" }),
      day: date.getDate(),
      category: category.label,
      secondaryCategory: faker.helpers.arrayElement(secondaryCategories),
      title: faker.helpers.arrayElement(eventTitles),
      time: `${faker.number.int({ min: 10, max: 18 })}:00`,
      location: faker.helpers.arrayElement(locations),
      addToCalendarLabel: "Add to Google Calendar",
    }
  }
)

export const sharedCalendarMonth = new Date(2026, 4, 1)
export const sharedCalendarSelectedDate = new Date(2026, 4, 28)
