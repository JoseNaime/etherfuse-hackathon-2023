'use client'
import React, {useState, useEffect} from 'react';
import toast, {Toaster} from 'react-hot-toast';
import Image from "next/image";
import {
    Connection,
    SystemProgram,
    Transaction,
    PublicKey,
    LAMPORTS_PER_SOL,
    clusterApiUrl
} from '@solana/web3.js';

const SOLANA_NETWORK = "devnet";

const OnePayment = ({toPay, CorralonKey}) => {
    const [publicKey, setPublicKey] = useState(null);
    const [balance, setBalance] = useState(0);
    const [exlorerUrl, setExlorerUrl] = useState(null);

    const CONVERTION_RATE_SOL_MXN = 373.86
    const toPayInSol = toPay / CONVERTION_RATE_SOL_MXN


    const handleSubmit = async (event) => {
        sendTransaction();
    };

    useEffect(() => {
        let key = localStorage.getItem('publicKey');
        setPublicKey(key);
        if (key) getBalance(key);
        if (exlorerUrl)
            setExlorerUrl(null);
    }, []);


    const signIn = async () => {
        //If phantom is not installed
        const provider = window?.phantom?.solana;
        const {solana} = window;

        if (!provider?.isPhantom || !solana.isPhantom) {
            toast.error('Phantom no esta instalado');
            setTimeout(() => {
                window.open('https://phantom.app/', '_blank');
            }, 2000);
            return;
        }

        // If phantom is installed
        let phantom;
        if (provider?.isPhantom) phantom = provider;

        const {publicKey} = await phantom.connect(); // Connect to wallet
        console.log("publicKey", publicKey.toString());
        setPublicKey(publicKey.toString());
        window.localStorage.setItem('publicKey', publicKey.toString());

        toast.success("Conectado a Phantom");

        // Get balance
        getBalance(publicKey);
    };

    // Funcion para desconectar
    const signOut = async () => {
        if (window) {
            const {solana} = window;
            window.localStorage.removeItem('publicKey');
            setPublicKey(null);
            solana.disconnect();
        }
    };

    // Funcion para obtener balance
    const getBalance = async (publicKey) => {
        try {
            const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
            const balance = await connection.getBalance(new PublicKey(publicKey));
            const balancenew = balance / LAMPORTS_PER_SOL;
            setBalance(balancenew);
        } catch (error) {
            console.error("Error al obtener balance", error);
            toast.error("Error al obtener balance");
        }
    };

    // Funcion para enviar transaccion
    const sendTransaction = async () => {
        try {
            // Consultar el balance
            getBalance(publicKey);

            // si el balance es menor la cantidad a enviar
            if (balance < toPayInSol) {
                toast.error("No tienes suficiente balance");
                return;
            }

            // Si el balance es mayor a la cantidad a enviar    
            const provider = window?.phantom?.solana;
            const connection = new Connection(clusterApiUrl(SOLANA_NETWORK), 'confirmed');

            //Llaves
            const fromPubkey = new PublicKey(publicKey);
            const toPubkey = new PublicKey(CorralonKey);

            // Creacion de transaccion
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey,
                    toPubkey,
                    lamports: parseInt(toPayInSol * LAMPORTS_PER_SOL),
                })
            );

            // Ultimo block de hash
            const {blockhash} = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = fromPubkey;

            // Firmar transaccion
            const transaccionSinature = await provider.signTransaction(transaction);

            // Enviar transaccion
            const txid = await connection.sendRawTransaction(transaccionSinature.serialize());

            // Confirmar transaccion
            const confirmation = await connection.confirmTransaction(txid, {commitment: 'singleGossip'});
            const {slot} = confirmation.value;

            const solanaExlorerUrl = `https://explorer.solana.com/tx/${txid}?cluster=${SOLANA_NETWORK}`;
            setExlorerUrl(solanaExlorerUrl);

            toast.success("Transaccion enviada con exito");

            // Actualizar balance
            getBalance(publicKey);
            return solanaExlorerUrl;


        } catch (error) {
            toast.error("Error al enviar transaccion");
        }
    };

    return (
        <div className={'w-3/5 '}>
            <Toaster position="bottom-right" reverseOrder={false} />
            <div>
                {publicKey ? (
                    <div>
                        <div className="mt-5 flex flex-row justify-end">
                            <p className="opacity-50 mr-2">Balance </p>
                            <p className='blue-gradient-text opacity-80 font-bold'>{balance} SOL</p>
                        </div>
                        <div className={"flex justify-between w-full"}>

                            <p className="font-bold">Origen </p>
                            <a className={"blue-gradient-text text-right"}
                               href={`https://explorer.solana.com/address/${publicKey}`}>{publicKey.slice(0, 4)}...{publicKey.slice(publicKey.length - 6, publicKey.length)}</a>
                        </div>

                        <div className="vertical-dots">
                            <p>.</p><p>.</p><p>.</p>
                        </div>
                        <div className={"flex justify-between w-full"}>
                            <p className="font-bold">Destino </p>
                            <a className={"blue-gradient-text text-right"}
                               href={`https://explorer.solana.com/address/${CorralonKey}`}
                            >{CorralonKey.slice(0, 4)}...{CorralonKey.slice(CorralonKey.length - 6, CorralonKey.length)}</a>
                        </div>

                        <div className="mt-7 flex flex-col">
                            <div id="total-display">
                                <p>Total</p>
                                <h6>{(toPay / CONVERTION_RATE_SOL_MXN).toFixed(6)} SOL</h6>
                            </div>
                            <p className={"text-gray-400 text-xm"}>1 SOL ~= 373.86 MXN</p>
                        </div>


                        <div className='flex justify-between mt-5 h-10'>
                            <button
                                className="secondary-button"
                                type='submit'
                                onClick={() => {
                                    signOut()
                                }}
                            >Cancelar
                            </button>
                            <button
                                className="primary-button"
                                type='submit'
                                onClick={() => {
                                    handleSubmit()
                                }}
                            >
                                Pagar
                            </button>
                            <br/>
                        </div>
                        <br/>
                        <a className="flex-1 break-words" href={exlorerUrl}>
                            <h6 className="text-xs font-bold text-blue-500 w-full">{exlorerUrl}</h6>
                        </a>
                    </div>
                ) : (
                    <button
                        id="phantom-button"

                        type='submit'
                        onClick={() => signIn()}
                    >
                        <Image src={"/images/phantom_icon.jpg"} height={30} width={30} alt={"Phantom Logo"} />
                        Paga con Phantom
                    </button>
                )}
            </div>
        </div>
    );
};

export default OnePayment;