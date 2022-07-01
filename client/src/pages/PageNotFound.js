import { Container, Link } from '@mui/material'
import NotFoundImg from '../assets/images/PageNotFound.svg'
import React from 'react'
import classes from '../css/PageNotFound.module.css'

function PageNotFound() {
    return (
        <div className={classes.notfoundbg}>
            <Container maxWidth='lg' sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', mb: '50px' }}>
                <img className={classes.img} src={NotFoundImg} alt='Page not found' />
                <Link href="/" underline="always" sx={{ mt: 5 }}>Back Home</Link>
            </Container>
        </div >
    )
}

export default PageNotFound