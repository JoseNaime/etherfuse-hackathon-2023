'use client'
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
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
        if (provider?.isPhantom)phantom = provider;

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
            console.log("balance", balance);

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
            console.log("transaction", transaction);

            // Ultimo block de hash
            const {blockhash} = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = fromPubkey;

            // Firmar transaccion
            const transaccionSinature = await provider.signTransaction(transaction);

            // Enviar transaccion
            const txid = await connection.sendRawTransaction(transaccionSinature.serialize());
            console.info(`Transaccion enviada: ${txid}`);

            // Confirmar transaccion
            const confirmation = await connection.confirmTransaction(txid, {commitment: 'singleGossip'});
            const { slot } = confirmation.value;

            console.info(`Transaccion ${txid} confirmada en el slot: ${slot}`);
            const solanaExlorerUrl = `https://explorer.solana.com/tx/${txid}?cluster=${SOLANA_NETWORK}`;
            setExlorerUrl(solanaExlorerUrl);

            toast.success("Transaccion enviada con exito");

            // Actualizar balance
            getBalance(publicKey);
            setAmount(0);
            return solanaExlorerUrl;


        } catch (error) {
            console.error("Error al enviar transaccion", error);
            toast.error("Error al enviar transaccion");
        }
    };

    return (
      <div>
        <Toaster position="top-center" reverseOrder={false}/>
        <h1>Siga un solo proceso de pago directo</h1>
        <div>
            <div>

            </div>
            <div>
                <h2>Paga con Phantom</h2>
                {publicKey ? (
                    <div>
                        <h3>Tu key es: {publicKey}</h3>
                        <h3>Tu balance es: {balance} SOL</h3>
                        <br/>
                        <h3>Corralon Key: {CorralonKey}</h3>
                        <br/>
                        <h3>Cantidad de SOL a enviar:</h3>
                        <input 
                            type="text" value={amount}
                            onChange={(e) => {handleAmountChange(e)}    
                            }
                        />
                        <br/>
                        <button
                            type='submit'
                            onClick={() => {handleSubmit()
                            }}
                        >
                            Enviar 
                        </button>

                        <br/>



                        <button
                            type='submit'
                            onClick={() => {signOut()
                            }}
                        >
                            Desconectar
                        </button>
                        <br/>
                        <a href={exlorerUrl}>
                            <h3 className="text-md font-bold text-blue-500">{exlorerUrl}</h3>
                        </a>
                        <br/>
                    </div> 
                ) : (
                    <button
                        type='submit'
                        onClick={() => signIn()}
                    >Conectar</button>
                )}
            </div>
        </div>
      </div>
    );
  };

export default OnePayment;