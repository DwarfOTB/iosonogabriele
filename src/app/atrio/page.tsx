import { redirect } from 'next/navigation'

/** Le porte ora sono la home: il vecchio indirizzo ci rimanda */
export default function Pagina() {
  redirect('/')
}
