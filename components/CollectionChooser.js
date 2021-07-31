import React from 'react';
import { BottomSheet, ListItem } from 'react-native-elements';


export function CollectionChooser({ showCollectionChooser, collectionModes, collectionMode, setCollectionMode}) {

  return (
    <BottomSheet
      isVisible={showCollectionChooser}
      containerStyle={{ backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)' }}>
      <ListItem key='0'>
        <ListItem.Content>
          <ListItem.Title>Collection à afficher</ListItem.Title>
        </ListItem.Content>
      </ListItem>
      {Object.entries(collectionModes).map(([mode, title], index) => (
        <ListItem key={index + 1}
          containerStyle={
            (collectionMode == mode ? { backgroundColor: 'dodgerblue' } : { backgroundColor: 'white' })}
          onPress={() => {
            setCollectionMode(mode); setShowCollectionChooser(false);
          }}>
          <ListItem.Content>
            <ListItem.Title style={
              (collectionMode == mode ? { color: 'white' } : { color: 'dodgerblue' })}>
              {title[0]}
            </ListItem.Title>
          </ListItem.Content>
        </ListItem>
      ))}
    </BottomSheet>
  );
}
