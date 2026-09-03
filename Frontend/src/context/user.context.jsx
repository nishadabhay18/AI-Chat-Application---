// import React, { createContext, useState, useContext } from 'react';

// // Create the UserContext
// export const UserContext = createContext();

// // Create a provider component
// export const UserProvider = ({ children }) => {
//     const [ user, setUser ] = useState(null);

//     return (
//         <UserContext.Provider value={{ user, setUser }}>
//             {children}
//         </UserContext.Provider>
//     );
// };


import React, {
    createContext,
    useState,
    useEffect
} from 'react'

import axios from '../config/axios.js'

export const UserContext = createContext()

export const UserProvider = ({ children }) => {

    const [user, setUser] = useState(null)

    useEffect(() => {

        axios.get('/users/profile')
            .then((res) => {
                console.log("PROFILE:", res.data)
                setUser(res.data.user)
            })
            .catch((err) => {
                console.log("PROFILE ERROR:", err.response?.data)
            })

    }, [])

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    )
}