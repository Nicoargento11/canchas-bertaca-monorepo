// import { NewOpinion } from "@/app/Type/Opinion"
// import canchasData from "@/app/Data/Canchas.json"

// // Extraer los nombres de las canchas del JSON
// const canchasNombres = canchasData.map(cancha => cancha.nombre)

// export async function searchVenues(query: string): Promise<string[]> {
//   // Buscar en los nombres de las canchas del JSON
//   const results = canchasNombres.filter(nombre =>
//     nombre.toLowerCase().includes(query.toLowerCase())
//   )

//   // Ordenar los resultados por relevancia
//   return results.sort((a, b) => {
//     const aMatch = a.toLowerCase().indexOf(query.toLowerCase())
//     const bMatch = b.toLowerCase().indexOf(query.toLowerCase())
//     return aMatch - bMatch
//   })
// }

// export async function createOpinion(opinion: NewOpinion): Promise<void> {
//   // Simulación de creación de opinión
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       try {
//         // Aquí iría la lógica real para crear la opinión
//         // Por ahora solo simulamos
//         resolve()
//       } catch (error) {
//         reject(error)
//       }
//     }, 1000)
//   })
// }
