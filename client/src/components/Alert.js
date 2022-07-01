import React, { useState } from 'react'
import { Alert as AlertComp, Collapse, CssBaseline, Grid, IconButton, Stack } from '@mui/material';
import { useAppContext } from '../context/appContext';
import CloseIcon from '@mui/icons-material/Close';
import ClearAllRoundedIcon from '@mui/icons-material/ClearAllRounded';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { blue } from '@mui/material/colors';

function Alert() {
    const contextValues = useAppContext()
    const [open, setOpen] = useState(true)
    let prevId = undefined
    return (
        <Stack spacing={1} sx={{ width: '30%', position: 'fixed', left: '69%', bottom: 0, mb: 2, zIndex: 2 }}>
            <Grid container spacing={2} sx={{ justifyContent: 'right' }}>
                <CssBaseline />
                <Grid item xs={1} onClick={() => { contextValues.clearAllAlerts() }} sx={{ cursor: 'pointer', color: 'white', minWidth: '45px', background: 'rgba(10, 10, 10, 0.5)', borderRadius: '10% 0 0 10%', p: 1 }}>
                    <ClearAllRoundedIcon />
                </Grid>
                <Grid item xs={1} onClick={() => setOpen(state => !state)} sx={{ cursor: 'pointer', color: 'white', minWidth: '45px', background: 'rgba(10, 10, 10, 0.5)', borderRadius: '0 10% 10% 0', p: 1, pr: 5 }}>
                    {!open ? <VisibilityOffIcon /> : <VisibilityIcon sx={{ color: blue[700] }} />}
                </Grid>
            </Grid>
            {
                contextValues.alerts && contextValues.alerts.length > 0 && contextValues.alerts.map(alert => {
                    if (alert.id === prevId) alert.id++
                    prevId = alert.id
                    return <Collapse in={open} key={alert.id}>
                        <AlertComp variant='filled' severity={alert.type} action={
                            <IconButton
                                aria-label="close"
                                color="inherit"
                                size="small"
                                onClick={() => {
                                    contextValues.clearAlert(alert.id)
                                }}
                            >
                                <CloseIcon fontSize="inherit" />
                            </IconButton>
                        }>
                            {alert.message}
                        </AlertComp>
                    </Collapse>
                })
            }
        </Stack >
    )
}

export default Alert