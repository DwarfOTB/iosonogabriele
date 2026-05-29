export interface RoomConfig {
  id: string
  label: string
  navLabel: string
  zOffset: number
  cameraPos: [number, number, number]
  cameraLookAt: [number, number, number]
  sunExpression: 'calm' | 'happy' | 'curious' | 'sleepy' | 'sad'
  fogColor: string
}

export const ROOMS: RoomConfig[] = [
  { id:'home',     label:'Home',     navLabel:'home',     zOffset:0,   cameraPos:[4,7,10],   cameraLookAt:[0,1.5,0],    sunExpression:'calm',    fogColor:'#AED6F1' },
  { id:'musica',   label:'Musica',   navLabel:'musica',   zOffset:-18, cameraPos:[-3,6,-8],  cameraLookAt:[0,2,-18],    sunExpression:'curious', fogColor:'#F4EDD8' },
  { id:'live',     label:'Live',     navLabel:'live',     zOffset:-36, cameraPos:[4,5,-26],  cameraLookAt:[0,2,-34],    sunExpression:'happy',   fogColor:'#0d0905' },
  { id:'archivio', label:'Archivio', navLabel:'archivio', zOffset:-54, cameraPos:[-3,6,-44], cameraLookAt:[0,2.5,-52],  sunExpression:'calm',    fogColor:'#C19A6B' },
  { id:'merch',    label:'Merch',    navLabel:'merch',    zOffset:-72, cameraPos:[3,5,-62],  cameraLookAt:[0,1.5,-70],  sunExpression:'sleepy',  fogColor:'#4A3018' },
]
