import axios, {AxiosError} from "axios";
import { parseCookies, setCookie } from "nookies"

let cookies = parseCookies()

type AxiosErrorProps = {
  code: string;
}

export const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    Authorization: `Bearer ${cookies['nextauth.token']}`
  }
});

api.interceptors.response.use(response => {
  return response;
}, (error: AxiosError<AxiosErrorProps>) => {
  if(error.response?.status === 401) {
    if(error.response?.data.code === 'token.expored'){
       cookies = parseCookies();

       const {'nextauth.refreshToken': refreshToken} = cookies;

       api.post('/refresh', {
         refreshToken,
       }).then((response) => {
         const {token} = response.data?.token;
         setCookie(undefined, 'nextauth.token', token, {
          maxAge: 60 * 60  * 1, // 1 hora
        
        })

        setCookie(undefined, 'nextauth.refreshToken', response.data.refreshToken, {
          maxAge: 60 * 60  * 1, // 1 hora
        
        })
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
       });
    }else {
      //deslogar o usuário
    }
  }
})