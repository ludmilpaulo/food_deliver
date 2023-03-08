export async function middleware(req){
    const token = await getToken({ req });

    const {pathname } = req.nextUrl 

    if(pathname.includes('/api/auth') || token) {
        return NextRespone.next()
    }

}