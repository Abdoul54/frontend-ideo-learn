const ImageBackground = ({ config }) => {
    return (
        <div className="absolute inset-0 overflow-hidden">
            <img
                src={config?.src || 'https://placehold.co/1920x1080/white/black?text=Forgot+To+Add+An+Image+Background'}
                alt={config?.alt}
                className="h-full w-full object-cover object-center transition-opacity duration-300"
                loading="eager"
                onError={(e) => {
                    e.target.src = 'https://placehold.co/1920x1080';
                }}
            />
        </div>
    );
}

const VideoBackground = ({ config }) => {
    return (
        <div className="absolute inset-0 overflow-hidden">
            <video
                onLoadedMetadata={e => {
                    e.target.muted = true;
                }}
                onCanPlay={e => {
                    const playPromise = e.target.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.error("Autoplay prevented:", error);
                        });
                    }
                }}
                className="h-full w-full object-cover object-center"
                poster={config?.poster || 'https://placehold.co/1920x1080/white/black?text=The+Video+Is+Not+Working+And+You+Forgot+To+Add+An+Image+Background'}
                autoPlay
                muted
                playsInline
                loop={config?.loop}
            >
                <source
                    type={config?.type}
                    src={config?.src}
                />
                <img
                    src={config?.poster || 'https://placehold.co/1920x1080/white/black?text=The+Video+Is+Not+Working+And+You+Forgot+To+Add+An+Image+Background'}
                    alt={config?.alt}
                    className="h-full w-full object-cover object-center transition-opacity duration-300"
                />
            </video>
        </div>
    );
}

const Background = ({ variant = 'color', color = "#111827", imageConfig, videoConfig }) => {
    const background = {
        image: <ImageBackground config={imageConfig} />,
        video: <VideoBackground config={videoConfig} />,
    }

    return (
        <div
            className="absolute inset-0 z-0 transition-colors duration-300"
            style={{
                backgroundColor: variant === 'color' ? color : 'transparent'
            }}
        >
            {background[variant] || null}
            {/* Backdrop overlay - now positioned after the content */}
            {
                variant !== 'color' && (
                    <div className="absolute inset-0 z-10 bg-black opacity-[10%] pointer-events-none" />
                )
            }
        </div>
    );
}

export default Background;