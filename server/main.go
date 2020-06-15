package main

import "fmt"
import "net/http"
import "encoding/json"
import "strings"
import "strconv"
import "io/ioutil"

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "GET, POST,DELETE,OPTIONS,PUT")
}

func getParam(r *http.Request, key string) string {
	keys, ok := r.URL.Query()[key]	
	
	if !ok || len(keys[0]) < 1 {
        return ""
    }
    
    return keys[0]
}

func CrewMembersHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "GET" {
		//RETURN count RECORDS FROM start_from
		
		scount := getParam(r, "count")
		if scount == "" {
			scount = "50"
		}
		count, err := strconv.ParseInt(scount, 10, 32)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
		}
		
		sstart_from := getParam(r, "start_from")
		if sstart_from == "" {
			sstart_from = "0"
		}
		start_from, err := strconv.ParseInt(sstart_from, 10, 32)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
		}
		if start_from > int64(len(*t)) {
			fmt.Fprintf(w, "[]")
			return
		}
		
		if start_from + count > int64(len(*t)) {
			count = int64(len(*t)) - start_from
		}
		
		res, err := json.Marshal((*t)[start_from: start_from + count])
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		w.Write(res)
	} else if r.Method == "POST" {
		//CREATE NEW RECORD
		body, err := ioutil.ReadAll(r.Body)
        if err != nil {
            http.Error(w, "can't read body", http.StatusBadRequest)
            return
        }
        var newMember CrewMember
        err = json.Unmarshal(body, &newMember)
        if err != nil {
			http.Error(w, "Wrong JSON structure " + err.Error(), http.StatusBadRequest)
            return
		}
		newID := t.AddMember(newMember)
		fmt.Fprintf(w, `{"ID": "%s"}`, newID)
	} else {
		http.Error(w, "", http.StatusMethodNotAllowed)
	}
	return
}
func CrewMemberHandler(w http.ResponseWriter, r *http.Request) {
	path := strings.Split(r.URL.Path, "/")
	ID := path[len(path) - 1]
	enableCors(&w)
	
	if r.Method == "GET" {
		// RETURN SINGLE RECORD
		i := t.GetMember(ID)
		if i == -1 {
			http.Error(w, "This record doesn't exist", http.StatusNotFound)
			return
		}
		res, err := json.Marshal((*t)[i])
		if err != nil {
			return
		}
		w.Write(res)
	} else if r.Method == "PUT" {
		// UPDATE RECORD
		body, err := ioutil.ReadAll(r.Body)
        if err != nil {
            http.Error(w, "can't read body", http.StatusBadRequest)
            return
        }
        var newMember CrewMember
        err = json.Unmarshal(body, &newMember)
        if err != nil {
			http.Error(w, "Wrong JSON structure " + err.Error(), http.StatusBadRequest)
            return
		}
		newMember.ID = ID
		err = t.UpdateMember(newMember)
		if err != nil {
			http.Error(w, "This record doesn't exist", http.StatusNotFound)
			return
		}
	} else if r.Method == "DELETE" {
		// DELETE RECORD
		err := t.DeleteMember(ID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	} else if r.Method == "OPTIONS" {
		// Do nothing, browser check for cors
	} else {
		http.Error(w, "", http.StatusMethodNotAllowed)
	}
	
	return
}

var t *Team

func main() {
	InitRandom()
	t = NewTeam(200)
	
	http.HandleFunc("/CrewMember", CrewMembersHandler)
	http.HandleFunc("/CrewMember/", CrewMemberHandler)
	err := http.ListenAndServe(":80", nil)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println("Server started")
	for  {
	}
}
