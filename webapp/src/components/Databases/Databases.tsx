import { Divider, Paper, Title } from '@mantine/core';
import { Fragment, useEffect, useState } from 'react';

import { IDatabases } from '../../common/types';
import { isArrayEmpty } from '../../utils';
import CreateDatabaseForm from './CreateDatabaseForm/CreateDatabaseForm';
import ListDatabases from './ListDatabases';

const serverHost = import.meta.env.VITE_REACT_APP_SERVER_HOST;

const fetchDatabases = async () => {
    const response = await fetch(`${serverHost}/api/posts/databases`);
    return response.ok ? await response.json() : [];
};

function Databases({ setDisabledNext }) {
    const [databases, setDatabases] = useState<IDatabases[] | []>([]);

    useEffect(() => {
        if (setDisabledNext !== undefined) {
            setDisabledNext(isArrayEmpty(databases));
        }
    }, [databases, setDisabledNext]);

    useEffect(() => {
        const prevDatabase = databases;
        async function getDatabases() {
            const currentDatabases = await fetchDatabases();
            if (JSON.stringify(prevDatabase) !== JSON.stringify(currentDatabases)) {
                setDatabases(currentDatabases);
            }
        }
        getDatabases();
    }, [databases]);

    return (
        <Fragment>
            <Title order={2}>PostLines</Title>
            <Paper shadow="lg" withBorder p="xl">
                <CreateDatabaseForm databases={databases} setDatabases={setDatabases} />
                <Divider my="md" />
                <ListDatabases databases={databases} setDatabases={setDatabases} />
            </Paper>
        </Fragment>
    );
}
export default Databases;
