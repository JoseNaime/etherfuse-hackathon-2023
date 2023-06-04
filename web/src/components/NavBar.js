import React from 'react';
import Image from "next/image";

function NavBar(props) {
    return (
        <nav className={"flex absolute w-full h-16"}>
            <div className={"wrapper items-center"}>
                <Image src={'/images/DEMA_icon.png'} alt="DEMA Icon" width={100} height={50} />
            </div>
        </nav>
    );
}

export default NavBar;