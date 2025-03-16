'use client';

import { useState } from 'react';
import TagModal from '../TagModal/TagModal';
import styles from '../../app/post/[slug]/PostHeader.module.scss';

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
  onLogMessage?: (msg: string) => void;
}

export default function TagModalWrapper({ documents, currentTags, allTags, tags, onLogMessage }: TagModalWrapperProps) {
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(currentTags);

  const handleTagClick = (tag: string) => {
    setSelectedTags([tag]);
    setIsTagModalOpen(true);
  };

  return (
    <>
      <div className={styles.tags}>
        {tags.map((tag, index) => (
          <button
            key={index}
            className={styles.tag}
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      <TagModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        currentTags={selectedTags}
        allTags={allTags}
        documents={documents}
        onLogMessage={onLogMessage}
      />
    </>
  );
}