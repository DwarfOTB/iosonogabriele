export interface Track {
  id: string
  title: string
  duration: string
  year: number
  spotifyUrl?: string
  youtubeUrl?: string
}

export const TRACKLIST: Track[] = [
  { id: 'track-01', title: 'Traccia 1',       duration: '3:24', year: 2024 },
  { id: 'track-02', title: 'Traccia 2',       duration: '4:01', year: 2024 },
  { id: 'track-03', title: 'Traccia 3',       duration: '2:58', year: 2024 },
  { id: 'track-04', title: 'Traccia 4',       duration: '3:45', year: 2023 },
  { id: 'track-05', title: 'Traccia 5',       duration: '5:12', year: 2023 },
  { id: 'track-06', title: 'Traccia 6',       duration: '3:33', year: 2023 },
  { id: 'track-07', title: 'Il Sole è Rosso', duration: '4:20', year: 2022, spotifyUrl: 'https://open.spotify.com/intl-it/album/0Ubx6rC0UAtiu2Mcl6M6F5' },
  { id: 'track-08', title: 'Traccia 8',       duration: '3:07', year: 2022 },
  { id: 'track-09', title: 'Traccia 9',       duration: '6:00', year: 2022 },
  { id: 'track-10', title: 'Traccia 10',      duration: '2:44', year: 2021 },
  { id: 'track-11', title: 'Traccia 11',      duration: '4:55', year: 2021 },
]
