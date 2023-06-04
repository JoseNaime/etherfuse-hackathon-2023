'use client';

import React, {useState} from 'react'
import Image from "next/image";

const carInforTest = {
    plates: "ABC-45-67",
    toPay: 5000,
    place: {
        address: "Calle 1, 123",
        opensAt: "08:00",
        closesAt: "18:00",
    }
}

export default function Home() {
    const [platesToSearch, setPlatesToSearch] = useState("");
    const [carInfo, setCarInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        setIsLoading(true);

        await setTimeout(() => {
            setIsLoading(false);
            setCarInfo(carInforTest);
        }, 4000);
    }


    return (
        <div className={"w-full h-full"}>
            <div id="title-container"
                 className={"absolute top-1/2 transform -translate-x-1 -translate-y-1/2 left-36 flex flex-col gap-14" }>
                <div>
                    <h1 className={"blue-gradient-text"}>Dónde Esta Mi Auto?</h1>
                </div>
                <div id="plates-form">
                    <input id={"plates-input"}
                           type="text"
                           placeholder="LLL-NN-NN"
                           onChange={(e) => setPlatesToSearch(e.target.value)}></input>
                    <button onClick={handleSearch} disabled={isLoading}>Buscar</button>
                </div>
            </div>
            <div id="car-info-container" className={carInfo ? "active" : ""}>
                <Image width={1026} height={660} src={"/images/map.png"}  alt="map"/>
                {(platesToSearch && carInfo)&&

                    <div>
                        <div>
                            <h3>{carInfo?.plates}</h3>
                            <p>Direccion: {carInfo?.place.address}</p>
                            <p>Horario: {carInfo?.place.opensAt} - {carInfo?.place.closesAt}</p>
                        </div>
                        <div>
                            <p><b>Saldo Pendiente</b></p>
                            <h2>${carInfo?.toPay}</h2>
                        </div>
                    </div>
                }

            </div>
        </div>
    )
}
