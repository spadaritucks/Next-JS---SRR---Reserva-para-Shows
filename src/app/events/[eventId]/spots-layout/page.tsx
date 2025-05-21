import { SpotSeat } from "@/components/SpotSeat";
import { EventModel, SpotModel, SpotStatus } from "@/models"
import { cookies } from "next/headers";
import Link from "next/link";


async function getEvent(eventId: number): Promise<{ event: EventModel, spots: SpotModel[] }> {
    const response = await fetch(`http://localhost:8000/events/${eventId}`, {
        next: {
            tags: [`events/${eventId}`],
          },
    })
    return response.json()

}

async function reserveSpots(formdata: FormData) {
    'use server'
    const spots = formdata.getAll('spots');
    console.log(formdata.get("eventId"))

    const cookieStore = await cookies();

    if (spots.length == 0) {
        return { error: "Selecione ao menos um assento" }
    }

    cookieStore.set('spots', JSON.stringify(spots));
    cookieStore.set("eventId", formdata.get("eventId") as string);
}


export default async function SpotsLayoutPage({ params }: { params: { eventId: string } }) {
    const { event, spots } = await getEvent(parseInt(params.eventId));
    const rowLetters = spots.map((spot) => spot.name[0]);
    const uniqueRowLetter = rowLetters.filter((letter, index) => rowLetters.indexOf(letter) === index)

    const spotGroupedByRow = uniqueRowLetter.map(letter => {
        return {
            row: letter,
            spots: spots.filter(spot => spot.name[0] === letter)
        }
    })

    const reservedSpotRow = (await cookies()).get('spots')?.value;
    const reservedSpots = reservedSpotRow ? JSON.parse(reservedSpotRow) : []

    return (
        <form action={reserveSpots}>
            <main className="container mx-auto py-8 px-4">
            <input type="hidden" name="eventId" value={event.id} />
                <h1 className="text-3xl font-bold mb-8">Assentos</h1>
                {spotGroupedByRow.map((row) => (
                    <div key={row.row} className="flex flex-row gap-3 items-center mb-3">
                        <div className="w-4">{row.row}</div>
                        <div className="ml-2 flex flex-row">
                            {row.spots.map((spot, key) => (
                                <SpotSeat
                                    key={key}
                                    spotId={spot.name}
                                    spotLabel={spot.name.slice(1)}
                                    reserve={reservedSpots.includes(spot.name)}
                                    disabled={spot.status == SpotStatus.sold}
                                />
                            ))}
                        </div>
                    </div>
                ))}
                <p className="text-white mt-2">
                    Assentos Escolhidos: {reservedSpots.join(', ')}
                </p>
                <p className="mt-2">
                    <button
                        type="submit"
                        className="bg-white hover:bg-gray-700 hover:text-white text-black font-bold py-2 px-4 rounded"
                    >
                        Reservar
                    </button>
                </p>
                <p className="mt-4">
                    <Link
                        href="/checkout"
                        className="bg-gray-700 hover:bg-gray-500 hover:text-white text-white font-bold py-2 px-4 rounded"
                    >
                        Comprar
                    </Link>
                </p>
            </main>

        </form>)
}