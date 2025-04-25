import { stringAvatar } from "@/utils/avatarGenerator";
import { Avatar } from "@mui/material";

const UserAvatar = ({ session, anchorRef, handleDropdownOpen }) => {
    const hasUserInfo = session?.user?.firstname && session?.user?.lastname;
    const hasAvatar = session?.user?.avatar;

    if (!hasUserInfo && !hasAvatar) {
        return (
            <Avatar
                ref={anchorRef}
                className='cursor-pointer bs-[38px] is-[38px] text-2xl text-backgroundPaper bg-secondary'
            >
                <i className='solar-user-bold-duotone' />
            </Avatar>
        );
    }

    return (
        <Avatar
            ref={anchorRef}
            {...(hasUserInfo
                ? stringAvatar(`${session.user.firstname.toUpperCase()} ${session.user.lastname.toUpperCase()}`)
                : {})}
            src={hasAvatar ? session.user.avatar : undefined}
            onClick={handleDropdownOpen}
            className='cursor-pointer bs-[38px] is-[38px]'
        />
    );
};

export default UserAvatar;
