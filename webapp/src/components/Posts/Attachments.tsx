import { Flex, Image, rem } from '@mantine/core';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import addFilesImage from '../../assets/appimg/actionsUI/add_files.png';
import saveFileImage from '../../assets/appimg/actionsUI/save_files.png';
import { IAttachment } from '../../common/types';
import { generateUniqueFileName, getImageContentType, getImageUrl, getUploadUrl, isArrayEmpty } from '../../utils';

const serverHost = import.meta.env.VITE_REACT_APP_SERVER_HOST;

function CurrentAttachments(props: { post_id: string; dbname: string; height: number }) {
    const { post_id, dbname, height } = props;
    let imagesHeight = height;
    if (!imagesHeight) imagesHeight = 200;
    const [attachments, setAttachments] = useState<IAttachment[]>([]);
    const [files, setFiles] = useState<FileWithPath[] | []>([]);

    useEffect(() => {
        fetch(`${serverHost}/api/posts/attachments?post_id=${post_id}&database_name=${dbname}`)
            .then((response) => response.json())
            .then((data) => setAttachments(data))
            .catch((error) => console.error(error));
    }, [post_id, attachments.length, dbname]);

    const showAttachments = () => {
        return attachments.map((attachment, index) => {
            const imageURL = getImageUrl(attachment);
            return (
                <Image
                    src={imageURL}
                    h={imagesHeight}
                    w="auto"
                    fit="contain"
                    key={index}
                    onDoubleClick={() => deleteAttachment(attachment)}
                />
            );
        });
    };

    const deleteAttachment = async (attachment: IAttachment): Promise<void> => {
        const fetchDeleteFile = async (post_id: string, filename: string) => {
            return await fetch(`${serverHost}/api/posts/attachment`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'DELETE',
                body: JSON.stringify({
                    database_name: dbname,
                    post_id,
                    attachment_filename: filename,
                }),
            });
        };
        const deleteFileFromAttachments = (fileToDelete: string) => {
            return [...attachments].filter(
                (attachment: IAttachment) => attachment.attachment_filename !== fileToDelete,
            );
        };
        try {
            const result = await fetchDeleteFile(attachment.post_id_attachment, attachment.attachment_filename);
            if (result.ok) {
                const newAttachmentsState = deleteFileFromAttachments(attachment.attachment_filename);
                setAttachments(() => newAttachmentsState);
                notifications.show({
                    color: 'teal',
                    title: 'Success',
                    message: `File deleted successfully`,
                    icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 2000,
                });
            }
        } catch (error) {
            console.error(error);
            notifications.update({
                color: 'red',
                title: 'Error',
                message: `Failed to delete file.`,
                loading: false,
                autoClose: 2000,
            });
        }
    };
    // LINE

    const previewUploads = () =>
        files.map((file: FileWithPath, index: number) => {
            const imageUrl: string = getUploadUrl(file);
            return (
                <Image key={index} src={imageUrl} h={imagesHeight} w="auto" onDoubleClick={() => removeUpload(index)} />
            );
        });

    const removeUpload = (index: number) => {
        const newFilesList = [...files];
        newFilesList.splice(index, 1);
        setFiles(newFilesList);
    };

    const handleUploads = async () => {
        const id = notifications.show({
            loading: true,
            title: 'Loading started',
            message: `Files loading is started.`,
            autoClose: false,
            withCloseButton: false,
        });
        try {
            let newFiles = [...files];

            for (const file of newFiles) {
                const newFile = await saveFileToStorage(file);
                newFiles = newFiles.filter((item) => item.name !== file.name);
                setFiles(newFiles);
                setAttachments((attachments) => [...attachments, ...newFile]);
            }

            console.log('All files processed successfully');
            notifications.update({
                id,
                color: 'teal',
                title: 'Success',
                message: `Files are uploaded successfully`,
                icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                loading: false,
                autoClose: 2000,
            });
        } catch (error) {
            console.error('Error processing files:', error);
            notifications.update({
                id,
                color: 'red',
                title: 'Error',
                message: `Files upload is failed`,
                loading: false,
                autoClose: 2000,
            });
        }
    };

    const saveFileToStorage = async (file: FileWithPath) => {
        const contentType = getImageContentType(file.name);
        try {
            //Generate unique file name
            const { UUID, uniqueFileName } = generateUniqueFileName(file.name);
            //Make a request to get signedURL
            const getPresignedURL = await fetch(
                `${serverHost}/api/storage/puturl?` + new URLSearchParams({ file: uniqueFileName, folder: 'images' }),
            );
            const { presignedURL } = await getPresignedURL.json();
            await fetch(presignedURL, {
                headers: {
                    'Content-Type': contentType,
                    'x-amz-acl': 'public-read',
                },
                method: 'PUT',
                body: file,
            });

            await fetch(`${serverHost}/api/posts/attachments`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify({
                    database_name: dbname,
                    attachment_id: UUID,
                    post_id,
                    attachment_filename: uniqueFileName,
                }),
            });

            const newFile = await [
                {
                    attachment_id: UUID,
                    post_id_attachment: post_id,
                    attachment_filename: uniqueFileName,
                },
            ];

            return newFile;
        } catch (error) {
            console.error(error);
        }
    };

    const noFiles = !isArrayEmpty(files);
    const noAttachments = !isArrayEmpty(attachments);

    return (
        <Flex mih={50} gap="md" justify="flex-start" align="flex-start" direction="row" wrap="wrap">
            {noAttachments && showAttachments()}
            <Dropzone
                onDrop={setFiles}
                accept={[
                    'image/png',
                    'image/jpeg',
                    'image/gif',
                    'image/webp',
                    // 'text/csv',
                    // 'text/plain',
                    'audio/mpeg',
                    'video/webm',
                    'video/mp4',
                    'application/pdf',
                    // 'application/msword',
                    // 'application/vnd.ms-excel',
                    // 'application/vnd.ms-powerpoint',
                ]}
            >
                <Image src={addFilesImage} h={imagesHeight} w="auto" />
            </Dropzone>
            {noFiles && previewUploads()}
            {noFiles && <Image src={saveFileImage} h={imagesHeight} w="auto" onDoubleClick={handleUploads} />}
        </Flex>
    );
}
export default CurrentAttachments;
