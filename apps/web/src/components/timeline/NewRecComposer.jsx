import React, { useState } from 'react';

export function NewRecComposer({ onSearch, onSubmit, searchResults = [] }) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('album');
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [description, setDescription] = useState('');

  async function handleSearch(event) {
    event.preventDefault();
    setSelectedAlbum(null);
    await onSearch({ query, type: searchType });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedAlbum) {
      return;
    }
    await onSubmit({ ...selectedAlbum, description });
    setDescription('');
    setSelectedAlbum(null);
    setQuery('');
  }

  return (
    <form className="card stack" onSubmit={handleSubmit}>
      <h3 className="section-title">New Rec</h3>
      <div className="row">
        <input
          placeholder="Search by album title or artist name"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select value={searchType} onChange={(event) => setSearchType(event.target.value)}>
          <option value="album">Album</option>
          <option value="artist">Artist</option>
        </select>
        <button className="button-secondary" type="button" onClick={handleSearch}>
          Search
        </button>
      </div>
      {searchResults.length ? (
        <div className="stack">
          {searchResults.map((album) => (
            <button
              key={album.albumMusicBrainzId}
              type="button"
              className="button-secondary"
              onClick={() => setSelectedAlbum(album)}
            >
              {album.albumTitle} - {album.artistName} ({album.releaseYear})
            </button>
          ))}
        </div>
      ) : null}
      {selectedAlbum ? (
        <div className="surface stack">
          <strong>{selectedAlbum.albumTitle}</strong>
          <span className="small-copy">{selectedAlbum.artistName}</span>
          <textarea
            maxLength={255}
            placeholder="Why are you recommending this album?"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <button className="button" type="submit">
            Share rec
          </button>
        </div>
      ) : null}
    </form>
  );
}
