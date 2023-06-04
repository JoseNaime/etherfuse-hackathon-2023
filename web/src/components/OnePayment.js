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
    clusterApiUrl,
    sendTransactionError,
} from '@solana/web3.js';

const SOLANA_NETWORK = "devnet";

const OnePayment = ({CorralonKey}) => {
    const [publicKey, setPublicKey] = useState(null);
    const [balance, setBalance] = useState(0);
    const [amount, setAmount] = useState(0);
    const [exlorerUrl, setExlorerUrl] = useState(null);

    const handleAmountChange = (event) => {
        setAmount(event.target.value);
        console.log("amount", amount);
    };

    const handleSubmit = async (event) => {
        console.log("receptor", CorralonKey);
        console.log("amount", amount);
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
            if (balance < amount) {
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
                    lamports: amount * LAMPORTS_PER_SOL,
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
            setAmount(0);
            return solanaExlorerUrl;


        } catch (error) {
            toast.error("Error al enviar transaccion");
        }
    };

    return (
        <div>
            <Toaster position="top-center" reverseOrder={false} />
            <div>
                {publicKey ? (
                    <div>
                        <p className={"blue-gradient-text"}>
                            <aside>Tu key es:</aside>
                            {publicKey}</p>
                        <p>Tu balance es: <br /> <h3>{balance} SOL</h3></p>

                        <input
                            type="text" value={amount}
                            onChange={(e) => {
                                handleAmountChange(e)
                            }
                            }
                        />
                        <div>


                            <button
                                type='submit'
                                onClick={() => {
                                    signOut()
                                }}
                            >
                                Desconectar/Cancelar
                            </button>
                            <button
                                type='submit'
                                onClick={() => {
                                    handleSubmit()
                                }}
                            >
                                Enviar
                            </button>
                        </div>
                        <a href={exlorerUrl}>
                            <h3 className="text-md font-bold text-blue-500">{exlorerUrl}</h3>
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