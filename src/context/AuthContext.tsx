import { createContext, ReactNode, useState } from "react";
import { api } from "../services/api";
import Router from "next/router"
import { setCookie } from "nookies";

type User = {
  email: string;
  permissions: string[]
  roles: string[];
};

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthProviderProps = {
  children: ReactNode;
};

type AuthContexData = {
  user: User;
  isAuthenticated: boolean;
  signIn(credentials: SignInCredentials): Promise<void>;
};



export const AuthContext = createContext({} as AuthContexData)

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>();
  const isAuthenticated = !!user;

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post('sessions', {
        email,
        password
      })

      const { token, refreshToken, permissions, roles } = response.data;

      setCookie(undefined, 'nextauth.token', token, {
        maxAge: 60 * 60  * 1, // 1 hora
        path: '/'
      })
      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge: 60 * 60  * 1, // 1 hora
        path: '/'
      })

      setUser({
        email,
        permissions,
        roles
      })

      Router.push("/dashboard")
    } catch (err) {
      console.log("[error]", err)
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )
}