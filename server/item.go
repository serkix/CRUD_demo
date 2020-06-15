package main

//import "encoding/json"
import (
	"crypto/sha256"
	"encoding/binary"
	"fmt"
	"encoding/base64"
 )

type CrewMember struct {
	ID			string	`json:"ID"`
	Name 		string	`json:"name"`
	Birthday 	string	`json:"birthday"`
	JobID		int		`json:"jobID"`
	Summary		string	`json:"summary"`
	Cabin		int		`json:"cabin"`
}

func (c CrewMember) Display () {
	fmt.Printf("ID - %s\n Name - %s\n Birthday - %s\n JobID - %d\n Summary - %s\n Cabin - %d\n", c.ID, c.Name, c.Birthday, c.JobID, c.Summary, c.Cabin)
}

type Team []CrewMember

func NewTeam(teamSize int) *Team {
	t := &Team{}
	for i := 0; i < teamSize; i++ {
		t.AddMember(GenRandomCrewMember())
	}
	return t
}


func (t *Team) AddMember(newMember CrewMember) string {
	var pos uint32 = uint32(len(*t))
	*t = append(*t, newMember)
	
	(*t)[pos].ID =  generateHash(pos)			// All hail the security gods! User should not know number of the items!
	
	return (*t)[pos].ID
}

func (t Team) GetMember(ID string) int {
	for i := range(t) {
		if t[i].ID == ID {
			return i
		}
	}
	return -1
}

func (t *Team) UpdateMember(newMember CrewMember) error {
	old := t.GetMember(newMember.ID)
	if old == -1 {
		return fmt.Errorf("User with id %s was not found\n", newMember.ID)
	}
	
	(*t)[old].Name 		= newMember.Name
	(*t)[old].Birthday 	= newMember.Birthday
	(*t)[old].JobID		= newMember.JobID
	(*t)[old].Summary 	= newMember.Summary
	(*t)[old].Cabin		= newMember.Cabin
	
	return nil
}

func (t *Team) DeleteMember(ID string) error {
	old := t.GetMember(ID)
	if old == -1 {
		return fmt.Errorf("User with id %s was not found\n", ID)
	}
	
	(*t)[len(*t)-1], (*t)[old] = (*t)[old], (*t)[len(*t)-1]
	*t = (*t)[:len(*t) - 1]
	
	return nil
}

func generateHash(num uint32) string {
	h := sha256.New()
	h.Write([]byte("Password")) // Add secure generation at the start of the program to make this better
	bs := make([]byte, 4)
	binary.LittleEndian.PutUint32(bs, num)
	return base64.StdEncoding.EncodeToString(h.Sum(bs))
}
