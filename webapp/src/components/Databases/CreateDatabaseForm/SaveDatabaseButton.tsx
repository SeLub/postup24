import { ActionIcon } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

const serverHost = import.meta.env.VITE_REACT_APP_SERVER_HOST;

const SavePublisherButton = (props) => {
    const { dbname, databases, setDatabases, saved, setSaved } = props;

    const savePublisher = async () => {
        const response = await fetch(`${serverHost}/api/posts/database`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dbname }),
        });
        const publisher = await response.json();
        setDatabases([...databases, publisher]);
        setSaved(true);
    };
    return (
        <ActionIcon component="button" disabled={saved} color={saved ? 'green' : 'red'} onClick={savePublisher}>
            <IconCheck size={18} />
        </ActionIcon>
    );
};
export default SavePublisherButton;
