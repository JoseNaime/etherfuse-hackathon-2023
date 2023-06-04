'use client';

import React, {useState} from 'react'
import Image from "next/image";
import OnePayment from "@/components/OnePayment";

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
        <div className={`w-full h-full ${carInfo ? "overflow-y-scroll" : "overflow-hidden"} `}>
            <div id="title-container"
                 className={`absolute top-1/2 transform -translate-x-1 -translate-y-1/2 left-36 flex flex-col gap-14 ${carInfo ? "active" : " "}`}>
                <div>
                    <h1 className={"blue-gradient-text"}>¿Dónde Está Mi Auto?</h1>
                </div>
                <div id="plates-form">
                    <input id={"plates-input"}
                           type="text"
                           placeholder="LLL-NN-NN"
                           onChange={(e) => setPlatesToSearch(e.target.value)}></input>
                    <button onClick={handleSearch} disabled={isLoading}>Buscar</button>
                </div>
            </div>
            <div id="car-info-container" className={carInfo ? "active relative" : "relative "}>
                <div className="pb-44">
                    <Image id="map-preview" width={1026} height={660} src={"/images/map_preview.png"} alt="map" />
                    {(platesToSearch && carInfo) &&

                        <div className={"w-full"}>
                            <div className="mt-20 flex w-full justify-between">
                                <div className={"flex flex-col justify-between"}>
                                    <h3 className={"blue-gradient-text"}>{carInfo?.plates}</h3>
                                    <aside>
                                        <p>Direccion: {carInfo?.place.address}</p>
                                        <p>Horario: {carInfo?.place.opensAt} - {carInfo?.place.closesAt}</p>
                                    </aside>
                                </div>
                                <div>
                                    <p className="text-right"><b>Saldo Pendiente</b></p>
                                    <h2 className={"blue-gradient-text"}>${carInfo?.toPay}</h2>
                                </div>
                            </div>
                            <div className="mt-28 flex w-full justify-between items-center">
                                <div className= "flex flex-1 items-center justify-center">
                                    <Image src={"/images/QR.png"}
                                           alt="QR" width={200} height={200} />
                                </div>
                                <hr className="vertical"/>
                                <div className="flex flex-1 items-center justify-center">
                                    <OnePayment />
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}
