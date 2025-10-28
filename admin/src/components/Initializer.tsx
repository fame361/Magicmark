import React, { useEffect, useRef } from 'react';
import type { StrapiApp } from '@strapi/strapi/admin';
import pluginId from '../pluginId';

interface InitializerProps {
  setPlugin: (pluginId: string) => void;
}

const Initializer: React.FC<InitializerProps> = ({ setPlugin }) => {
  const ref = useRef(setPlugin);

  useEffect(() => {
    // Mark plugin as ready
    ref.current(pluginId);
  }, []);

  return null;
};

export default Initializer;
