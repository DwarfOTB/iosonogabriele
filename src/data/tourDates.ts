export interface TourDate {
  id: string
  date: string
  city: string
  venue: string
  ticketUrl?: string
  soldOut?: boolean
}

export const TOUR_DATES: TourDate[] = []
