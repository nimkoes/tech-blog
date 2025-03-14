'use client';

import { useState } from 'react';
import TagModal from '../TagModal/TagModal';
import styles from './PostHeader.module.scss';

interface DocumentInfo {
  title: string;
  tags: string[];
  fileName: string;
}

interface TagModalWrapperProps {
  documents: DocumentInfo[];
  currentTags: string[];
  allTags: string[];
  tags: string[];
}

export default function TagModalWrapper({ documents, currentTags, allTags, tags }: TagModalWrapperProps) {
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  return (
    <>
      <div className={styles.tags}>
        {tags.map((tag, index) => (
          <span
            key={index}
            className={styles.tag}
            onClick={() => setIsTagModalOpen(true)}
          >
            {tag}
          </span>
        ))}
      </div>
      <TagModal
        isOpen={isTagModalOpen}
        documents={documents}
        currentTags={currentTags}
        allTags={allTags}
        onClose={() => setIsTagModalOpen(false)}
      />
    </>
  );
} 