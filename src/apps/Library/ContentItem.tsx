import { Link } from 'react-router-dom';
import style from './style.module.css';

interface Props {
    image?: string;
    url: string;
    title: string;
    description?: string;
}

export default function ContentItem({ url, title, image, description }: Props) {
    return (
        <li>
            <Link
                to={url}
                reloadDocument
            >
                {image && (
                    <div className={style.imageContainer}>
                        <img
                            src={image}
                            alt={title}
                            width={300}
                            height={200}
                        />
                    </div>
                )}
                <h2>{title}</h2>
                {description && <div className={style.description}>{description}</div>}
            </Link>
        </li>
    );
}
