import { Card, CardContent, CardHeader, Divider, Stack, Typography } from "@mui/material";
import { memo } from "react";

const HomeCard = ({ title, children, card }) => {
    const commonHeaderStyles = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: {
            xs: 2,
            sm: 3
        }
    };

    return (
        <Card sx={{
            width: card?.width,
            minWidth: { xs: '100%', sm: 'auto' }
        }}>
            <CardHeader
                sx={commonHeaderStyles}
                title={
                    <Stack
                        direction="column"
                        justifyContent='center'
                        alignItems='center'
                        spacing={1}
                    >
                        <Typography
                            variant='h4'
                            sx={{
                                ...card?.title?.sx,
                                textAlign: 'center',
                                wordBreak: 'break-word'
                            }}
                        >
                            {title}
                        </Typography>
                        <Divider sx={{
                            width: card?.divider?.sx?.width,
                            border: 2,
                            borderRadius: 1,
                            borderColor: 'primary.main',
                        }} />
                    </Stack>
                }
            />
            <CardContent
                sx={{
                    ...card?.content?.sx,
                    padding: {
                        xs: 2,
                        sm: 3
                    }
                }}
            >
                {children}
            </CardContent>
        </Card>
    );
}

export default memo(HomeCard);