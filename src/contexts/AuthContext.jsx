import React, { createContext, useContext, useEffect, useState } from 'react'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    deleteUser,
    reauthenticateWithCredential,
    EmailAuthProvider
} from 'firebase/auth'
import { doc, setDoc, deleteDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

const AuthContext = createContext()

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user)
            setLoading(false)
        })

        return unsubscribe
    }, [])

    async function register(email, password) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: userCredential.user.email,
            score: 0,
            achievements: [],
            createdAt: new Date().toISOString()
        })
        return userCredential
    }

    async function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password)
    }

    async function logout() {
        return signOut(auth)
    }

    async function deleteAccount(password) {
        const user = auth.currentUser
        const credential = EmailAuthProvider.credential(user.email, password)

        try {
            await reauthenticateWithCredential(user, credential)
            await deleteDoc(doc(db, 'users', user.uid))
            await deleteUser(user)
        } catch (error) {
            throw new Error('Ошибка при удалении аккаунта: ' + error.message)
        }
    }

    const value = {
        currentUser,
        register,
        login,
        logout,
        deleteAccount
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
} 