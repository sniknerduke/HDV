package com.example.onlineCourses.dto;

public class ImportPlaylistResponse {
    private int imported;

    public ImportPlaylistResponse(int imported) {
        this.imported = imported;
    }

    public int getImported() {
        return imported;
    }

    public void setImported(int imported) {
        this.imported = imported;
    }
}
